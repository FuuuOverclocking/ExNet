export let monitor: any;

export function setMonitor(mon: any): void {
    monitor = mon;
    console.log(process.env.NODE_ENV);
}
export const a = 123;
