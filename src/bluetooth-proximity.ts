import { BluetoothSerialPort } from 'bluetooth-serial-port'
import { EventEmitter } from 'events'
import { StateMachine, IStateMachineDescription, StateTransition } from 'ts-fence'
import Debug from 'debug'

const debug = Debug('bluetooth')

interface BluetoothStateMachineDescription extends IStateMachineDescription {
  isAvailable: boolean
  bluetooth: BluetoothProximity
}

function createStateMachine(bluetooth: BluetoothProximity): StateMachine {
  return new StateMachine({
    bluetooth,
    isAvailable: false,
    [StateMachine.STARTING_STATE]: 'off',
    [StateMachine.STATES]: {
      off: {
        poweredOn: new StateTransition(
          'ready',
          ({ scope }: { scope: BluetoothStateMachineDescription }) => {
            debug('poweredOn')
          }
        )
      },
      ready: {
        [StateMachine.ON_ENTRY_FROM]: {
          off({
            scope,
            stateMachine
          }: {
            scope: BluetoothStateMachineDescription
            stateMachine: any
          }) {
            debug('ON_ENTRY_FROM off')
            stateMachine.scan()
          }
        },
        scan: new StateTransition('scanning', (): any => debug('scan')),
        poweredOff: new StateTransition('off', (): any => undefined)
      },
      scanning: {
        [StateMachine.ON_ENTER]: ({ scope }: { scope: BluetoothStateMachineDescription }) => {
          scope.bluetooth.start()
        },
        poweredOff: new StateTransition('off', (): any => undefined),
        [StateMachine.ON_EXIT]: ({ scope }: { scope: BluetoothStateMachineDescription }) => {
          scope.bluetooth.stop()
        }
      },
      connected: {}
    }
  } as BluetoothStateMachineDescription)
}

export interface IBluetoothScanOptions {
  serviceUUIDs: Array<string>
  allowDuplicates: boolean
}

export interface BluetoothDevice {
  address: string
  name: string
}

export interface IBluetooth {
  devices: Array<BluetoothDevice>
  isAvailable: boolean
  options: IBluetoothScanOptions

  start(): void
  stop(): void
}

const RSSI_THRESHOLD = -70

export default class BluetoothProximity extends EventEmitter implements IBluetooth {
  private _intervalId: number
  private _lastSeen: Map<string, Date> = new Map()
  private _stateMachine: StateMachine
  private _bluetoothSerialPort: BluetoothSerialPort
  public devices: Array<BluetoothDevice> = []
  public isAvailable: boolean = false
  public options: IBluetoothScanOptions = { serviceUUIDs: [], allowDuplicates: true }

  constructor(timeout: number = 5000) {
    super()
    this._stateMachine = createStateMachine(this)

    this._bluetoothSerialPort = new BluetoothSerialPort()
    this._bluetoothSerialPort.on('found', (address: string, name: string) =>
      this._onBluetoothDeviceDiscovered({ address, name } as BluetoothDevice)
    )
    this._bluetoothSerialPort.on('close', () => {
      debug('Connection closed')
    })
    this._bluetoothSerialPort.on('finished', () => {
      debug('Connection finished')
    })

    this._intervalId = 0
    // this._intervalId = setInterval(() => self._onInterval(timeout), timeout / 2)
  }

  private _onInterval(timeout: number): void {
    debug('onInterval')
    for (const [id, datetime] of this._lastSeen) {
      const time = datetime.getTime()
      const now = Date.now()
      const diff = now - timeout

      if (time < diff) {
        this._lastSeen.delete(id)
        let index = -1
        const peripheral = this.devices.find((p, i, _) => {
          if (p.address === id) {
            index = i
            return true
          }
          return false
        })

        this.devices.splice(index, 1)
        debug(`REMOVE id=${id} ble.peripherals.length=${this.devices.length}`)
        this.emit('remove', peripheral)
      }
    }
  }

  private _onBluetoothDeviceDiscovered(device: BluetoothDevice): void {
    // if (device.rssi < RSSI_THRESHOLD) {
    //   return
    // }

    if (!this._lastSeen.has(device.address)) {
      // New ble device discovered
      this.devices.push(device)
      debug(
        `ADD address=${device.address} name=${device.name} devices.length=${this.devices.length}`
      )
      this.emit('add', device)
    }

    const date = new Date()
    debug(`UPDATE address=${device.address} name=${device.name} date=${date.toISOString()}`)
    this._lastSeen.set(device.address, date)
  }

  public start(): void {
    debug('start')
    this._bluetoothSerialPort.inquireSync()
  }

  public stop(): void {
    debug('stop')
  }
}
