import type { Group } from './types';
import { merge } from './utilities';
import { LocalDomain } from './local-domain';

export class LocalGroup implements Group {
    public readonly domain!: LocalDomain;
    public readonly gid: number = LocalDomain.localCounters.allocateGroupGid();
}

merge(LocalGroup.prototype, {
    domain: LocalDomain,
});
