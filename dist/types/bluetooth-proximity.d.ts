/// <reference types="node" />
import { EventEmitter } from 'events';
export interface IBluetoothScanOptions {
    serviceUUIDs: Array<string>;
    allowDuplicates: boolean;
}
export interface BluetoothDevice {
    address: string;
    name: string;
}
export interface IBluetooth {
    devices: Array<BluetoothDevice>;
    isAvailable: boolean;
    options: IBluetoothScanOptions;
    start(): void;
    stop(): void;
}
export default class BluetoothProximity extends EventEmitter implements IBluetooth {
    private _intervalId;
    private _lastSeen;
    private _stateMachine;
    private _bluetoothSerialPort;
    devices: Array<BluetoothDevice>;
    isAvailable: boolean;
    options: IBluetoothScanOptions;
    constructor(timeout?: number);
    private _onInterval;
    private _onBluetoothDeviceDiscovered;
    start(): void;
    stop(): void;
}
