import { monitor } from './monitor';
export * from './core/api';
import { setMonitor } from './core/local-domain';

setMonitor(monitor);
