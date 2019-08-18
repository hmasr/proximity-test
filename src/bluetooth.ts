import noble from 'noble'

export interface IBluetooth {
  peripherals: Array<noble.Peripheral>
  isAvailable: boolean
}

export default class Bluetooth implements IBluetooth {
  public peripherals: noble.Peripheral[] = []
  public isAvailable: boolean = false

  constructor() {
    noble.on('stateChange', this._onStateChange)
    noble.on('discover', this._onPeripheralDiscovered)
  }

  private _onStateChange(state: string): void {
    if (state === 'poweredOn') {
      noble.startScanning()
    } else {
      noble.stopScanning()
    }
  }

  private _onPeripheralDiscovered(peripheral: noble.Peripheral): void {
    if (this.peripherals.find(o => o.id === peripheral.id)) {
      return
    }
    this.peripherals.push(peripheral)
  }
}

noble.on('discover', function(peripheral: noble.Peripheral) {
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
})
