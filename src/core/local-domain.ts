import type { Domain, RemoteDomain, LocalGroup, RemoteGroup, Node } from './types';
import { cuuid, EventEmitter, TinyBigInt } from './utilities';
import { log } from './debug';

type MonitorType = undefined | typeof import('../monitor').monitor;

export class LocalDomainClass extends EventEmitter<Domain.LocalDomainEvents> implements Domain {
    /** Domain ID uniquely identifies a domain among interconnected domains. */
    public readonly id: string = cuuid(8);
    /** Every time the program re-runs, `runID` is randomly generated. */
    public readonly runID: string = cuuid(24);
    public readonly isLocal: true = true;

    /** @internal */
    public readonly localCounters = {
        nodeNid: 0,
        nodeActID: new TinyBigInt(0),
        groupGid: 0,
        allocateNodeNid(): number {
            return this.nodeNid++;
        },
        allocateNodeActID(): TinyBigInt {
            const num = new TinyBigInt(this.nodeActID);
            this.nodeActID.addOne();
            return num;
        },
        allocateGroupGid(): number {
            return this.groupGid++;
        },
    };

    public readonly remoteDomains = new Set<RemoteDomain>();
    public readonly onlineRemoteDomains = new Set<RemoteDomain>();
    public readonly offlineRemoteDomains = new Set<RemoteDomain>();

    public readonly localGroups = new Set<LocalGroup>();

    public readonly remoteGroups = new Set<RemoteGroup>();
    public readonly onlineRemoteGroups = new Set<RemoteGroup>();
    public readonly offlineRemoteGroups = new Set<RemoteGroup>();

    public throwUncaughtNodeError(nodeError: Node.NodeError): void {
        const handlers = this.eventHandlers.uncaughtNodeError;

        if (handlers && handlers.length) {
            for (const handler of handlers) {
                const isCaught = handler.call(LocalDomain, nodeError);
                if (isCaught) return;
            }
        }

        log.error(nodeError);
        throw new Error();
    }

    public monitor: MonitorType = void 0;
    public boot(): void {
        // ...
    }
}

export const LocalDomain = new LocalDomainClass();
export type LocalDomain = typeof LocalDomain;

export let monitor: MonitorType = void 0;
export const localCounters = LocalDomain.localCounters;

export function setMonitor(mon: MonitorType): void {
    LocalDomain.monitor = monitor = mon;
    LocalDomain.boot();
}
