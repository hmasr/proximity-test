"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bluetooth_serial_port_1 = require("bluetooth-serial-port");
const events_1 = require("events");
const ts_fence_1 = require("ts-fence");
const debug_1 = require("debug");
const debug = debug_1.default('bluetooth');
function createStateMachine(bluetooth) {
    return new ts_fence_1.StateMachine({
        bluetooth,
        isAvailable: false,
        [ts_fence_1.StateMachine.STARTING_STATE]: 'off',
        [ts_fence_1.StateMachine.STATES]: {
            off: {
                poweredOn: new ts_fence_1.StateTransition('ready', ({ scope }) => {
                    debug('poweredOn');
                })
            },
            ready: {
                [ts_fence_1.StateMachine.ON_ENTRY_FROM]: {
                    off({ scope, stateMachine }) {
                        debug('ON_ENTRY_FROM off');
                        stateMachine.scan();
                    }
                },
                scan: new ts_fence_1.StateTransition('scanning', () => debug('scan')),
                poweredOff: new ts_fence_1.StateTransition('off', () => undefined)
            },
            scanning: {
                [ts_fence_1.StateMachine.ON_ENTER]: ({ scope }) => {
                    scope.bluetooth.start();
                },
                poweredOff: new ts_fence_1.StateTransition('off', () => undefined),
                [ts_fence_1.StateMachine.ON_EXIT]: ({ scope }) => {
                    scope.bluetooth.stop();
                }
            },
            connected: {}
        }
    });
}
const RSSI_THRESHOLD = -70;
class BluetoothProximity extends events_1.EventEmitter {
    constructor(timeout = 5000) {
        super();
        this._lastSeen = new Map();
        this.devices = [];
        this.isAvailable = false;
        this.options = { serviceUUIDs: [], allowDuplicates: true };
        this._stateMachine = createStateMachine(this);
        this._bluetoothSerialPort = new bluetooth_serial_port_1.BluetoothSerialPort();
        this._bluetoothSerialPort.on('found', (address, name) => this._onBluetoothDeviceDiscovered({ address, name }));
        this._bluetoothSerialPort.on('close', () => {
            debug('Connection closed');
        });
        this._bluetoothSerialPort.on('finished', () => {
            debug('Connection finished');
        });
        this._intervalId = 0;
        // this._intervalId = setInterval(() => self._onInterval(timeout), timeout / 2)
    }
    _onInterval(timeout) {
        debug('onInterval');
        for (const [id, datetime] of this._lastSeen) {
            const time = datetime.getTime();
            const now = Date.now();
            const diff = now - timeout;
            if (time < diff) {
                this._lastSeen.delete(id);
                let index = -1;
                const peripheral = this.devices.find((p, i, _) => {
                    if (p.address === id) {
                        index = i;
                        return true;
                    }
                    return false;
                });
                this.devices.splice(index, 1);
                debug(`REMOVE id=${id} ble.peripherals.length=${this.devices.length}`);
                this.emit('remove', peripheral);
            }
        }
    }
    _onBluetoothDeviceDiscovered(device) {
        // if (device.rssi < RSSI_THRESHOLD) {
        //   return
        // }
        if (!this._lastSeen.has(device.address)) {
            // New ble device discovered
            this.devices.push(device);
            debug(`ADD address=${device.address} name=${device.name} devices.length=${this.devices.length}`);
            this.emit('add', device);
        }
        const date = new Date();
        debug(`UPDATE address=${device.address} name=${device.name} date=${date.toISOString()}`);
        this._lastSeen.set(device.address, date);
    }
    start() {
        debug('start');
        this._bluetoothSerialPort.inquire();
    }
    stop() {
        debug('stop');
    }
}
exports.default = BluetoothProximity;
//# sourceMappingURL=bluetooth-proximity.js.map