import { LogLevel, LogService, LoggableObject, MessageWithNodeAndComponent } from './types';
export { LogLevel, LogService, LoggableObject, MessageWithNodeAndComponent };
import { CLILogService } from './cli-log-service';
import type { Node, NodeCore, SubnetCore } from 'core/types';

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

    // eslint-disable-next-line no-inner-declarations
    function withNodeAndComponent(
        msg: string,
        node?: Node | NodeCore<any, any> | SubnetCore<any, any> | 0,
        comp?: string,
    ): MessageWithNodeAndComponent {
        return { msg, node: node || void 0, comp };
    }

    export const withNC = {
        error(...args: Parameters<typeof withNodeAndComponent>): void {
            error(withNodeAndComponent(...args));
        },
        warn(...args: Parameters<typeof withNodeAndComponent>): void {
            warn(withNodeAndComponent(...args));
        },
        info(...args: Parameters<typeof withNodeAndComponent>): void {
            info(withNodeAndComponent(...args));
        },
        debug(...args: Parameters<typeof withNodeAndComponent>): void {
            debug(withNodeAndComponent(...args));
        },
    };
}

export function registerLogService(...services: LogService[]): void {
    logServices.push(...services);
}

registerLogService(CLILogService);
