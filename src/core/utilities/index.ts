export * from './environment';
export * from './cuuid';
export * from './tiny-big-int';
export * from './stack';
export * from './priority-queue';
export * from './it-is';
export * from './asap';
export * from './event-str2num';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(): void {}

/**
 * Shallow merge.  Faster than native implementation `Object.assign`.
 */
export function merge<T, U>(target: T, source: U): T & U {
    const keys = Object.keys(source);
    const len = keys.length;
    for (let i = 0; i < len; ++i) {
        (target as any)[keys[i]] = (source as any)[keys[i]];
    }

    return target as T & U;
}
export function mergeTwo<T, U, V>(
    target: T,
    source1: U,
    source2: V,
): T & U & V {
    const keys1 = Object.keys(source1);
    const len1 = keys1.length;
    for (let i = 0; i < len1; ++i) {
        (target as any)[keys1[i]] = (source1 as any)[keys1[i]];
    }

    const keys2 = Object.keys(source1);
    const len2 = keys1.length;
    for (let i = 0; i < len2; ++i) {
        (target as any)[keys2[i]] = (source2 as any)[keys2[i]];
    }

    return target as T & U & V;
}
