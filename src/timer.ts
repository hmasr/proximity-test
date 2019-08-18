export interface ITimer {
  interval: number
  autoReset: boolean
  enabled: boolean
  elapsed: Function | undefined

  start(): void
  stop(): void
  restart(): void
}

export default class Timer implements ITimer {
  public interval: number
  public autoReset: boolean
  public enabled: boolean = false
  public elapsed: Function | undefined

  private _id: number | undefined

  constructor(_interval: number, _autoReset: boolean = false) {
    if (_interval <= 0) {
      throw new Error("'interval' must be greater than zero.")
    }

    this.interval = _interval
    this.autoReset = _autoReset
  }

  start(): void {
    this.enabled = true

    if (this.autoReset) {
      this._id = setInterval(this.elapsed as TimerHandler, this.interval)
    } else {
      this._id = setTimeout(this.elapsed as TimerHandler, this.interval)
    }
  }

  stop(): void {
    this.enabled = false
    if (this.autoReset) {
      clearInterval(this._id)
    } else {
      clearTimeout(this._id)
    }
    this._id = undefined
  }

  restart(): void {
    this.stop()
    this.start()
  }
}
