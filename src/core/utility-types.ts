import type { LocalNode } from './types';

export type Dictionary<T> = { [key: string]: T };

export type AnyFunction = (...args: any) => any;

// prettier-ignore
export type getStateOfLocalNode<N> =
    N extends LocalNode<infer S, any> ? S : never;

// prettier-ignore
export type getPortsOfLocalNode<N> =
    N extends LocalNode<any, infer P> ? P : never;
