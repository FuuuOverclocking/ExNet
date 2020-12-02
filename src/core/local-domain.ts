import { log } from './debug';
import { Domain, RemoteDomain, LocalGroup, RemoteGroup, Node } from './types';
import { cuuid, domainEventNameToType, TinyBigInt } from './utilities';
import { AnyFunction } from './utility-types';

type MonitorType = undefined | typeof import('../monitor').monitor;

export interface LocalDomain extends Domain {
    /** Domain ID uniquely identifies a domain among interconnected domains. */
    readonly id: string;
    /** Every time the program re-runs, `runID` is randomly generated. */
    readonly runID: string;
    readonly isLocal: true;

    /** @internal */
    readonly localCounters: {
        nodeNid: number;
        nodeActID: TinyBigInt;
        groupGid: number;
        allocateNodeNid(): number;
        allocateNodeActID(): TinyBigInt;
        allocateGroupGid(): number;
    };

    readonly remoteDomains: Set<RemoteDomain>;
    readonly onlineRemoteDomains: Set<RemoteDomain>;
    readonly offlineRemoteDomains: Set<RemoteDomain>;

    readonly localGroups: Set<LocalGroup>;

    readonly remoteGroups: Set<RemoteGroup>;
    readonly onlineRemoteGroups: Set<RemoteGroup>;
    readonly offlineRemoteGroups: Set<RemoteGroup>;

    readonly eventHandlers: AnyFunction[][];

    on(event: string | number, handler: AnyFunction): void;

    emitUncaughtNodeError(nodeError: Node.NodeError): void;

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
    localCounters: {
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
    },

    remoteDomains: new Set<RemoteDomain>(),
    onlineRemoteDomains: new Set<RemoteDomain>(),
    offlineRemoteDomains: new Set<RemoteDomain>(),

    localGroups: new Set<LocalGroup>(),

    remoteGroups: new Set<RemoteGroup>(),
    onlineRemoteGroups: new Set<RemoteGroup>(),
    offlineRemoteGroups: new Set<RemoteGroup>(),

    eventHandlers: [],
    on(event: string | number, handler: AnyFunction): void {
        if (typeof event === 'string') {
            event = domainEventNameToType(event) ?? -1;
        }
        if (
            event < 0 ||
            event >= Domain.Event.LocalDomainEventType.NumberOfEventTypes ||
            !Number.isInteger(event)
        ) {
            log.withNC.error('Invalid event type.', 0, 'LocalDomain.on()');
            throw new Error();
        }

        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [handler];
        } else {
            this.eventHandlers[event].push(handler);
        }
    },

    emitUncaughtNodeError(nodeError: Node.NodeError): void {
        const handlers: Domain.Event.UncaughtNodeErrorHandler[] = this
            .eventHandlers[Domain.Event.LocalDomainEventType.UncaughtNodeError];
        if (handlers && handlers.length) {
            for (const handler of handlers) {
                const isCaught = handler.call(LocalDomain, nodeError);
                if (isCaught) return;
            }
        }

        log.error(nodeError);
        throw new Error();
    },

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
