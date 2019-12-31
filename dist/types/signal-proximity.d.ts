/// <reference types="node" />
import { Gpio } from 'onoff';
import { EventEmitter } from 'events';
export default class SignalProximity extends EventEmitter {
    private readonly timer;
    private readonly gpio;
    isTriggered: boolean;
    constructor(gpio: Gpio, timeout?: number);
    private _onGpioWatch;
    stop(): void;
}
