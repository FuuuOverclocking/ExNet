import type { Node, NodeCore, SubnetCore } from '../types';

export const enum LogLevel {
    Off = 0,
    Error = 1,
    Warn = 2,
    Info = 3,
    Debug = 4,
}

export interface LogService {
    input(level: LogLevel, s: string | LoggableObject): void;
}

// prettier-ignore
export type LoggableObject =
    | MessageWithNodeAndComponent
    | Node.NodeError
    ;

export interface MessageWithNodeAndComponent {
    msg: string;
    node?: Node | NodeCore<any, any> | SubnetCore<any, any>;
    comp?: string;
}
