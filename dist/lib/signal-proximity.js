"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const timer_1 = require("./timer");
const events_1 = require("events");
const debug_1 = require("debug");
const debug = debug_1.default('signal');
class SignalProximity extends events_1.EventEmitter {
    constructor(gpio, timeout = 10000) {
        super();
        this.isTriggered = false;
        const self = this;
        this.gpio = gpio;
        this.timer = new timer_1.default(timeout);
        this.timer.elapsed = function () {
            debug('timer elapsed');
            self.isTriggered = false;
            self.emit('end');
        };
        this._onGpioWatch(null, this.gpio.readSync());
        this.gpio.watch(this._onGpioWatch.bind(this));
    }
    _onGpioWatch(err, value) {
        if (err) {
            console.error(err);
            return;
        }
        this.emit('change');
        debug(`GPIO=${value}`);
        if (value === 1) {
            this.emit('begin');
            this.isTriggered = true;
            this.timer.stop();
        }
        else {
            this.timer.start();
        }
    }
    stop() {
        debug('stop');
        this.timer.stop();
        this.gpio.unexport();
    }
}
exports.default = SignalProximity;
//# sourceMappingURL=signal-proximity.js.map