export * from './types';
import {
    LogLevel,
    LogService,
    LoggableObject,
    MessageWithNodeAndComponent,
} from './types';
import { Node } from '../types';
import { CLILogService } from './cli-log-service';

const logServices: LogService[] = [];
let currentLogLevel = LogLevel.Info;

export function logLevel(level?: LogLevel): LogLevel {
    if (level !== void 0) {
        currentLogLevel = level;
    }
    return currentLogLevel;
}

function logMessage(level: LogLevel, thing: string | LoggableObject): void {
    if (currentLogLevel <= level) return;

    for (const service of logServices) {
        service.input(level, thing);
    }
}

export function log(thing: string | LoggableObject): void {
    logMessage(LogLevel.Info, thing);
}

export namespace log {
    export function error(thing: string | LoggableObject): void {
        logMessage(LogLevel.Error, thing);
    }

    export function warn(thing: string | LoggableObject): void {
        logMessage(LogLevel.Warn, thing);
    }

    export function info(thing: string | LoggableObject): void {
        logMessage(LogLevel.Info, thing);
    }

    export function debug(thing: string | LoggableObject): void {
        logMessage(LogLevel.Debug, thing);
    }
}

export function withNC(
    msg: string,
    node?: Node | 0,
    comp?: string,
): MessageWithNodeAndComponent {
    return { msg, node: node || void 0, comp };
}

export function registerLogService(...services: LogService[]): void {
    logServices.push(...services);
}

registerLogService(CLILogService);
