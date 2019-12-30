import { Gpio, BinaryValue } from 'onoff'
import Timer from './timer'
import { EventEmitter } from 'events'

export default class SignalProximity extends EventEmitter {
  private readonly timer: Timer
  private readonly gpio: Gpio
  constructor(gpio: Gpio, timeout: number = 10000) {
    super()

    this.gpio = gpio
    this.timer = new Timer(timeout)
    this.timer.elapsed = function() {
      console.log('timer elapsed')
    }
    this._onGpioWatch(null, this.gpio.readSync())
    this.gpio.watch(this._onGpioWatch.bind(this))
  }

  private _onGpioWatch(err: Error | null | undefined, value: BinaryValue) {
    if (err) {
      console.error(err)
      return
    }

    this.timer.restart()
  }

  public start() {
    this.timer.start()
  }

  public stop() {
    this.timer.stop()
    this.gpio.unexport()
  }
}
