import * as noble from '@abandonware/noble'
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
        [StateMachine.ON_EXIT]: () => noble.stopScanning()
      },
      connected: {}
    }
  } as BluetoothStateMachineDescription)
}

export interface IBluetoothScanOptions {
  serviceUUIDs: Array<string>
  allowDuplicates: boolean
}

export interface IBluetooth {
  peripherals: Array<noble.Peripheral>
  isAvailable: boolean
  options: IBluetoothScanOptions

  start(): void
  stop(): void
}

function Log(peripheral: noble.Peripheral) {
  console.log(
    'peripheral discovered (' +
      peripheral.id +
      ' with address <' +
      peripheral.address +
      ', ' +
      peripheral.addressType +
      '>,' +
      ' connectable ' +
      peripheral.connectable +
      ',' +
      ' RSSI ' +
      peripheral.rssi +
      ':'
  )
  console.log('\thello my local name is:')
  console.log('\t\t' + peripheral.advertisement.localName)
  console.log('\tcan I interest you in any of the following advertised services:')
  console.log('\t\t' + JSON.stringify(peripheral.advertisement.serviceUuids))

  const serviceData = peripheral.advertisement.serviceData
  if (serviceData && serviceData.length) {
    console.log('\there is my service data:')
    for (let i in serviceData) {
      console.log(
        '\t\t' +
          JSON.stringify(serviceData[i].uuid) +
          ': ' +
          JSON.stringify(serviceData[i].data.toString('hex'))
      )
    }
  }
  if (peripheral.advertisement.manufacturerData) {
    console.log('\there is my manufacturer data:')
    console.log('\t\t' + JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex')))
  }
  if (peripheral.advertisement.txPowerLevel !== undefined) {
    console.log('\tmy TX power level is:')
    console.log('\t\t' + peripheral.advertisement.txPowerLevel)
  }

  console.log()
}

const RSSI_THRESHOLD = -70

export default class Bluetooth extends EventEmitter implements IBluetooth {
  private _intervalId: number
  private _lastSeen: Map<string, Date> = new Map()
  private _stateMachine: StateMachine
  public peripherals: Array<noble.Peripheral> = []
  public isAvailable: boolean = false
  public options: IBluetoothScanOptions = { serviceUUIDs: [], allowDuplicates: true }

  constructor(timeout: number = 5000) {
    super()
    this._stateMachine = createStateMachine(this)
    const self = this
    noble.on('stateChange', (state: string) => {
      log(`noble state=${state}`)
      self._onStateChange.call(this, { ble: self }, state)
    })
    noble.on('warning', (warning: string) => {
      log(warning)
    })
    noble.on('discover', (peripheral: noble.Peripheral) => {
      log(`noble discover=${peripheral}`)
      self._onPeripheralDiscovered.call(this, { ble: self }, peripheral)
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
        const peripheral = this.peripherals.find((p, i, _) => {
          if (p.id === id) {
            index = i
            return true
          }
          return false
        })

        this.peripherals.splice(index, 1)
        log(`REMOVE id=${id} ble.peripherals.length=${this.peripherals.length}`)
        this.emit('remove', peripheral)
      }
    }
  }

  private _onStateChange({ ble }: { ble: Bluetooth }, state: string): void {
    log(`_onStateChange state=${state}`)
    if (state === 'poweredOn') {
      this._stateMachine.poweredOn()
    } else {
      this._stateMachine.poweredOff()
    }
  }

  private _onPeripheralDiscovered({ ble }: { ble: Bluetooth }, peripheral: noble.Peripheral): void {
    if (peripheral.rssi < RSSI_THRESHOLD) {
      return
    }

    // Log(peripheral)

    if (!ble._lastSeen.has(peripheral.id)) {
      // New ble device discovered
      ble.peripherals.push(peripheral)
      log(`ADD id=${peripheral.id} ble.peripherals.length=${ble.peripherals.length}`)
      ble.emit('add', peripheral)
    }

    console.log(`id=${peripheral.id} rssi=${peripheral.rssi}`)
    ble._lastSeen.set(peripheral.id, new Date())
  }

  public start(): void {
    noble.startScanning(this.options.serviceUUIDs, this.options.allowDuplicates, error => {
      if (error) {
        console.error(error)
      }
    })
  }

  public stop(): void {
    log('stop')
    noble.stopScanning()
  }
}
