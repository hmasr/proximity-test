import { Gpio } from 'onoff'
import SignalProximity from '../src/gpio-proximity'
import BluetoothProximity from '../src/bluetooth-proximity'
import { execSync } from 'child_process'
import { config } from 'dotenv'

export namespace Proximity {
  // Load dotenv config file
  config()

  const bluetooth = new BluetoothProximity()
  bluetooth.on('add', peripheral => {
    console.log(peripheral)
  })

  bluetooth.start()

  const gpio4 = new Gpio(4, 'in', 'both')

  const signalProximity = new SignalProximity(
    gpio4,
    process.env.SIGNAL_TIMEOUT as number | undefined
  )
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
