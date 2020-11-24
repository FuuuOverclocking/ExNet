import { configure, setMonitor } from './core/config';

setMonitor(null);
configure({
    logLevel: 'warn',
});

export * from './core';
