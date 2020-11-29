import type { LogLevel, LoggableObject } from './types';

export const CLILogService = {
    input(level: LogLevel, thing: string | LoggableObject): void {
        console.log(level, thing);
    },
};
