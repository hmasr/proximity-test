export interface ITimer {
    interval: number;
    autoReset: boolean;
    enabled: boolean;
    elapsed: Function | undefined;
    start(): void;
    stop(): void;
    restart(): void;
}
export default class Timer implements ITimer {
    interval: number;
    autoReset: boolean;
    enabled: boolean;
    elapsed: Function | undefined;
    private _id;
    constructor(_interval: number, _autoReset?: boolean);
    start(): void;
    stop(): void;
    restart(): void;
}
