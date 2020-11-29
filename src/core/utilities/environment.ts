declare const window: any;
declare const self: any;

export const globalObject: any =
    typeof globalThis !== 'undefined'
        ? globalThis
        : typeof global !== 'undefined'
        ? global
        : typeof this !== 'undefined'
        ? this
        : typeof window !== 'undefined'
        ? window
        : self;

export const isDev = process.env.NODE_ENV !== 'production';

export function isNative(ctor: any): boolean {
    return typeof ctor === 'function' && /native code/.test(ctor.toString());
}

export const hasSymbol =
    typeof Symbol !== 'undefined' &&
    isNative(Symbol) &&
    typeof Reflect !== 'undefined' &&
    isNative(Reflect.ownKeys);
