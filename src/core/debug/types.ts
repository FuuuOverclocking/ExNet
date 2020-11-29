import { Node } from '../types';

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

export type LoggableObject = MessageWithNodeAndComponent;

export interface MessageWithNodeAndComponent {
    msg: string;
    node?: Node;
    comp?: string;
}
