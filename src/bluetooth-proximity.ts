import { BluetoothSerialPort } from 'bluetooth-serial-port'
import { EventEmitter } from 'events'
import { StateMachine, IStateMachineDescription, StateTransition } from 'ts-fence'
import debug from 'debug'

const log = debug('bluetooth')

interface BluetoothStateMachineDescription extends IStateMachineDescription {
  isAvailable: boolean
  ble: Bluetooth
}

function createStateMachine(ble: Bluetooth): StateMachine {
  return new StateMachine({
    ble,
    isAvailable: false,
    [StateMachine.STARTING_STATE]: 'off',
    [StateMachine.STATES]: {
      off: {
        poweredOn: new StateTransition(
          'ready',
          ({ scope }: { scope: BluetoothStateMachineDescription }) => {
            log('poweredOn')
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
            log('ON_ENTRY_FROM off')
            stateMachine.scan()
          }
        },
        scan: new StateTransition('scanning', (): any => log('scan')),
        poweredOff: new StateTransition('off', (): any => undefined)
      },
      scanning: {
        [StateMachine.ON_ENTER]: ({ scope }: { scope: BluetoothStateMachineDescription }) => {
          scope.ble.start()
        },
        poweredOff: new StateTransition('off', (): any => undefined),
        [StateMachine.ON_EXIT]: ({ scope }: { scope: BluetoothStateMachineDescription }) => {
          scope.ble.stop()
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

export default class Bluetooth extends EventEmitter implements IBluetooth {
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
    this._bluetoothSerialPort.on('found', (address: string, name: string) => {
      log(`new device address=${address} name=${name}`)
    })
    this._bluetoothSerialPort.on('close', () => {
      log('Connection closed')
    })
    this._bluetoothSerialPort.on('finished', () => {
      log('Connection finished')
    })

    this._intervalId = 0
    // this._intervalId = setInterval(() => self._onInterval(timeout), timeout / 2)
  }

  private _onInterval(timeout: number): void {
    log('onInterval')
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
        log(`REMOVE id=${id} ble.peripherals.length=${this.devices.length}`)
        this.emit('remove', peripheral)
      }
    }
  }

  private _onPeripheralDiscovered({ ble }: { ble: Bluetooth }, device: BluetoothDevice): void {
    // if (device.rssi < RSSI_THRESHOLD) {
    //   return
    // }

    if (!ble._lastSeen.has(device.address)) {
      // New ble device discovered
      ble.devices.push(device)
      log(`ADD id=${device.address} ble.peripherals.length=${ble.devices.length}`)
      ble.emit('add', device)
    }

    ble._lastSeen.set(device.address, new Date())
  }

  public start(): void {
    log('start')
    this._bluetoothSerialPort.inquireSync()
  }

  public stop(): void {
    log('stop')
  }
}
