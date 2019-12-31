"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Timer {
    constructor(_interval, _autoReset = false) {
        this.enabled = false;
        if (_interval <= 0) {
            throw new Error("'interval' must be greater than zero.");
        }
        this.interval = _interval;
        this.autoReset = _autoReset;
    }
    start() {
        this.enabled = true;
        if (this.autoReset) {
            this._id = setInterval(this.elapsed, this.interval);
        }
        else {
            this._id = setTimeout(this.elapsed, this.interval);
        }
    }
    stop() {
        this.enabled = false;
        if (this.autoReset) {
            clearInterval(this._id);
        }
        else {
            clearTimeout(this._id);
        }
        this._id = undefined;
    }
    restart() {
        this.stop();
        this.start();
    }
}
exports.default = Timer;
//# sourceMappingURL=timer.js.map