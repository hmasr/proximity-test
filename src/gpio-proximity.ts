import { Gpio, BinaryValue } from 'onoff'
import Timer from './timer'
import { EventEmitter } from 'events'

export namespace Proximity {
  export class SignalProximity extends EventEmitter {
    private readonly timer: Timer
    private readonly gpio: Gpio
    constructor(gpio: Gpio, timeout: number = 10000) {
      super()

      this.gpio = gpio
      this.timer = new Timer(timeout)
      this.timer.elapsed = function() {
        console.log('timer elapsed')
      }
      this.gpio.watch(this._onGpioWatch.bind(this))
    }

    private _onGpioWatch(err: Error | null | undefined, value: BinaryValue) {
      try {
        if (err) {
          console.log(err)
          throw err
        }
        console.log(`Watch = ${value}`)

        this.timer.restart()
      } catch (error) {
        console.error(error)
      }
    }

    public start() {
      this.timer.start()
    }

    public stop() {
      this.gpio.unexport()
    }
  }
}
