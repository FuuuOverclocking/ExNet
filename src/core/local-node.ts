import { ElementType, LocalGroup, Node } from './types';
import { Elem, merge } from './utilities';
import { LocalDomain } from './local-domain';
import { NodeCore } from './node-core';
import { SubnetCore } from './subnet-core';

const { localCounters } = LocalDomain;

export class LocalNode<S, P extends object> implements Node {
    public readonly type!: ElementType.LocalNode | ElementType.LocalSubnet;

    public readonly core!: NodeCore<S, P> | SubnetCore<S, P>;

    /* Identification */
    public readonly nid: number = localCounters.allocateNodeNid();
    public readonly domain!: LocalDomain;
    public get brand(): string {
        return this.core.brand;
    }
    public set brand(value: string) {
        this.core.brand = value;
    }
    public readonly isSubnet!: boolean;

    /* Group information */
    public readonly groups: LocalGroup[] = [];

    /* Topology */
    public readonly ports: any;
    public readonly portsState: Node.NodePortsState<P> = {};

    /* State */
    public get state(): S {
        return this.core.state;
    }
    public set state(value: S) {
        this.core.state = value;
    }

    /* Events */
    public on(event: Node.LocalNodeEventType, handler: Function): void {
        this.core.on(event, handler);
    }

    /** Call signature without parameters is only used for inheritance of LocalSubnet. */
    constructor();
    constructor(core: NodeCore<S, P>);
    constructor(state: S, onrun: Node.NodeEvent.NodeRun<LocalNode<S, P>>);
    constructor(state?: any, onrun?: any) {
        if (Elem.isNodeCore(state)) {
            this.installCore(state);
        } else if (typeof onrun !== 'undefined') {
            this.installCore(new NodeCore(state as S, onrun));
        }
    }

    private installCore(core: NodeCore<S, P>): void {
        (this as any).core = core;
        core.addShell(this);
    }

    public activate(
        data?: any,
        controlInfo?: Node.NodeControlInfo,
    ): void | Promise<void> {
        controlInfo ??= {};

        const actID = localCounters.allocateNodeActID();
        let stage = Node.NodeWorkingStage.NodeWillRun;
    }
}

merge(LocalNode.prototype, {
    type: ElementType.LocalNode,
    domain: LocalDomain,
    isSubnet: false,
});
