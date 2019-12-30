import { Gpio, BinaryValue } from 'onoff'
import Timer from './timer'
import { EventEmitter } from 'events'
import Debug from 'debug'

const debug = Debug('signal')

export default class SignalProximity extends EventEmitter {
  private readonly timer: Timer
  private readonly gpio: Gpio
  public isTriggered: boolean = false

  constructor(gpio: Gpio, timeout: number = 10000) {
    super()

    const self = this
    this.gpio = gpio
    this.timer = new Timer(timeout)
    this.timer.elapsed = function() {
      debug('timer elapsed')
      self.isTriggered = false
      self.emit('end')
    }
    this._onGpioWatch(null, this.gpio.readSync())
    this.gpio.watch(this._onGpioWatch.bind(this))
  }

  private _onGpioWatch(err: Error | null | undefined, value: BinaryValue) {
    if (err) {
      console.error(err)
      return
    }

    this.emit('change')
    debug(`GPIO=${value}`)
    if (value === 1) {
      this.emit('begin')
      this.isTriggered = true
      this.timer.stop()
    } else {
      this.timer.start()
    }
  }

  public stop() {
    debug('stop')
    this.timer.stop()
    this.gpio.unexport()
  }
}
