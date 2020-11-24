import monitor from './monitor';
import { configure, setMonitor } from './core/config';

setMonitor(monitor);
configure({
    logLevel: 'info',
});

export * from './core';
