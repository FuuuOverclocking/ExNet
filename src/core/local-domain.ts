import type { Domain, RemoteDomain, LocalGroup, RemoteGroup } from './types';
import { cuuid, TinyBigInt } from './utilities';

type MonitorType = undefined | typeof import('../monitor').monitor;

export interface LocalDomain extends Domain {
    /** Domain ID uniquely identifies a domain among interconnected domains. */
    readonly id: string;
    /** Every time the program re-runs, `runID` is randomly generated. */
    readonly runID: string;
    readonly isLocal: true;

    /** @internal */
    readonly localNodeCounters: {
        nid: number;
        runID: TinyBigInt;
    };

    readonly remoteDomains: Set<RemoteDomain>;
    readonly onlineRemoteDomains: Set<RemoteDomain>;
    readonly offlineRemoteDomains: Set<RemoteDomain>;

    readonly localGroups: Set<LocalGroup>;

    readonly remoteGroups: Set<RemoteGroup>;
    readonly onlineRemoteGroups: Set<RemoteGroup>;
    readonly offlineRemoteGroups: Set<RemoteGroup>;

    monitor: MonitorType;
    boot(): void;
}

export const LocalDomain: LocalDomain = {
    /** Domain ID uniquely identifies a domain among interconnected domains. */
    id: cuuid(8),
    /** Every time the program re-runs, `runID` is randomly generated. */
    runID: cuuid(24),
    isLocal: true,

    /** @internal */
    localNodeCounters: {
        nid: 0,
        runID: new TinyBigInt(0),
    },

    remoteDomains: new Set<RemoteDomain>(),
    onlineRemoteDomains: new Set<RemoteDomain>(),
    offlineRemoteDomains: new Set<RemoteDomain>(),

    localGroups: new Set<LocalGroup>(),

    remoteGroups: new Set<RemoteGroup>(),
    onlineRemoteGroups: new Set<RemoteGroup>(),
    offlineRemoteGroups: new Set<RemoteGroup>(),

    monitor: void 0,
    boot(): void {
        // ...
    },
};

export let monitor: MonitorType = void 0;

export function setMonitor(mon: MonitorType): void {
    LocalDomain.monitor = monitor = mon;
    LocalDomain.boot();
}
