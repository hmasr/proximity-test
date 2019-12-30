import { Gpio } from 'onoff'
import SignalProximity from './gpio-proximity'
import BluetoothProximity from './bluetooth-proximity'
import { execSync } from 'child_process'
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
    try {
      execSync('vcgencmd display_power 1')
    } catch (error) {
      console.error(error)
    }
  })
  signalProximity.on('end', function() {
    console.log('Turn display OFF')
    try {
      execSync('vcgencmd display_power 0')
    } catch (error) {
      console.error(error)
    }
  })

  process.on('SIGINT', () => {
    signalProximity.stop()
  })
}
