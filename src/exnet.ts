// This file is a copy of `src/exnet.dev.ts`. Components in `src/attrs`,
// `src/connectors` and `src/nodes` import the things of `core/` from this file.
// Refer to `script/build.js` to learn more about the build process of the
// project and the role of the file.

import monitor from './monitor';
import { configure, setMonitor } from './core/config';

setMonitor(monitor);
configure({
    logLevel: 'info',
});

export * from './core';
