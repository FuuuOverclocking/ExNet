import { ElementType, ExSubnet, LocalGroup, Net, Node } from './types';
import { It, merge } from './utilities';
import { LocalDomain } from './local-domain';
import { LocalNode } from './local-node';
import { SubnetCore } from './subnet-core';
import { ExLocalPortSet, LocalPortSet } from './local-port-set';

export class Subnet<S, P extends object> implements LocalNode<S, P> {
    public readonly type!: ElementType.Subnet; // defined on prototype

    public readonly surfaceNode!: ExSubnet<S, P>;
    public readonly rawNode: Subnet<S, P>;

    public readonly core: SubnetCore<S, P>;

    public readonly nid: number;
    public readonly domain!: LocalDomain; // defined on prototype
    // prettier-ignore
    public get brand(): string { return this.core.brand }
    // prettier-ignore
    public set brand(value: string) { this.core.brand = value }

    public groups: LocalGroup[];

    public net: Net;
    // prettier-ignore
    public get parent(): Node.ParentType { return this.net.parent }
    public readonly ports: ExLocalPortSet<P>;
    // prettier-ignore
    public get innerPorts(): ExLocalPortSet<P> { return this.core.innerPorts }
    // prettier-ignore
    public get subnet(): Net { return this.core.subnet }
    // prettier-ignore
    public get children(): Set<Node> { return this.core.children }
    public readonly portsState: Node.PortsState<P>;

    // prettier-ignore
    public get state(): S { return this.core.state }
    // prettier-ignore
    public set state(value: S) { this.core.state = value }

    constructor(core: SubnetCore<any, any>);
    constructor(
        state: S,
        define: Node.SubnetDefine<S, P>,
        onrun?: Node.Event.SubnetRun<Subnet<S, P>>,
    );
    constructor(state: any, define?: any, onrun?: any) {
        if (It.isSubnetCore(state)) {
            this.core = state;
        } else {
            this.core = new SubnetCore(state, define, onrun);
        }
    }

    public throwError(nodeError: Node.NodeError, fromChild: boolean): void {
        // ...
    }

    public on<K extends keyof Node.SubnetEvents<Subnet<S, P>>>(
        event: K,
        handler: Node.SubnetEvents<Subnet<S, P>>[K],
    ): void {
        this.core.on(event, handler);
    }
    public off<K extends keyof Node.SubnetEvents<Subnet<S, P>>>(
        event: K,
        handler: Node.SubnetEvents<Subnet<S, P>>[K],
    ): void {
        this.core.off(event, handler);
    }
}

merge(Subnet.prototype, {
    type: ElementType.Subnet,
    domain: LocalDomain,
});
