import { Gpio } from 'onoff'
import SignalProximity from './gpio-proximity'
import BluetoothProximity from './bluetooth-proximity'

export namespace Proximity {
  const bluetooth = new BluetoothProximity()
  bluetooth.on('add', peripheral => {
    console.log(peripheral)
  })

  bluetooth.start()

  const gpio4 = new Gpio(4, 'in', 'both')

  const signalProximity = new SignalProximity(gpio4)
  signalProximity.on('begin', function() {
    console.log('Turn display ON')
  })
  signalProximity.on('end', function() {
    console.log('Turn display OFF')
  })

  process.on('SIGINT', () => {
    signalProximity.stop()
  })
}
