import { Gpio, BinaryValue } from 'onoff'
import Timer from './timer'
import { EventEmitter } from 'events'
import Debug from 'debug'

const debug = Debug('signal')

export default class SignalProximity extends EventEmitter {
  private readonly timer: Timer
  private readonly gpio: Gpio

  constructor(gpio: Gpio, timeout: number = 10000) {
    super()

    this.gpio = gpio
    this.timer = new Timer(timeout)
    this.timer.elapsed = function() {
      debug('timer elapsed')
    }
    this._onGpioWatch(null, this.gpio.readSync())
    this.gpio.watch(this._onGpioWatch.bind(this))
  }

  private _onGpioWatch(err: Error | null | undefined, value: BinaryValue) {
    if (err) {
      console.error(err)
      return
    }

    debug(`GPIO=${value}`)
    this.timer.restart()
  }

  public start() {
    debug('start')
    this.timer.start()
  }

  public stop() {
    debug('stop')
    this.timer.stop()
    this.gpio.unexport()
  }
}
