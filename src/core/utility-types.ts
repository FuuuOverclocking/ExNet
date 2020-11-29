import type { ExPort, LocalNode } from './types';

export type Dictionary<T = any> = { [key: string]: T };

// prettier-ignore
export type getStateOfLocalNode<N> =
    N extends LocalNode<infer S, any> ? S : never;

// prettier-ignore
export type getPortsOfLocalNode<N> =
    N extends LocalNode<any, infer P> ? P : never;

// prettier-ignore
export type extractTypeFromPortTypeDescriptor<TD> =
    TD extends ExPort<infer T, any> ? T : TD;