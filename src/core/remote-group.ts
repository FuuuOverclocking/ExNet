import type { Group, RemoteDomain } from './types';

export class RemoteGroup implements Group {
    constructor(
        public readonly domain: RemoteDomain,
        public readonly gid: number,
    ) {}
}
