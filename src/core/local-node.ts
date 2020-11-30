import { ElementType, LocalGroup, Node } from './types';
import { Asap, Elem, isPromise, merge, noop } from './utilities';
import { LocalDomain } from './local-domain';
import { NodeCore } from './node-core';
import { SubnetCore } from './subnet-core';
import { Dictionary } from './utility-types';

const { localCounters } = LocalDomain;

class NodeRunConsoleEntry {
    constructor(public name: string) {
        (this as any)[name] = true;
    }
    public is(portName: string): boolean {
        return portName === this.name;
    }
}

export class LocalNode<S, P extends object> implements Node {
    public readonly type!: ElementType.LocalNode | ElementType.LocalSubnet;

    public readonly rawNode: LocalNode<S, P>;
    public readonly exNode: ExNode<S, P>;

    public readonly core!: NodeCore<S, P> | SubnetCore<S, P>;

    /* Identification */
    public readonly nid: number;
    public readonly domain!: LocalDomain;
    public get brand(): string {
        return this.core.brand;
    }
    public set brand(value: string) {
        this.core.brand = value;
    }
    public readonly isSubnet!: boolean;

    /* Group information */
    public readonly groups: LocalGroup[];

    /* Topology */
    public readonly ports: any;
    public readonly portsState: Node.NodePortsState<P>;

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
        this.rawNode = this;
        this.exNode = void 0 as any;
        this.nid = localCounters.allocateNodeNid();
        this.groups = [];
        this.portsState = {};

        if (Elem.isNodeCore(state)) {
            this.initNode(state);
        } else if (typeof onrun !== 'undefined') {
            this.initNode(new NodeCore(state as S, onrun));
        }
    }

    private nodeRunConsolePrototypeRaw!: {
        node: ExNode<S, P>;
    };
    private nodeRunConsolePrototype!: {
        node: ExNode<S, P>;
        state: S;
    } & Dictionary<(data: any) => void>;

    private initNode(core: NodeCore<S, P>): void {
        (this as any).core = core;
        core.addShell(this);

        this.nodeRunConsolePrototypeRaw = {
            node: this.exNode,
        };
        this.nodeRunConsolePrototype = new Proxy(
            this.nodeRunConsolePrototypeRaw,
            {
                get(target, prop) {
                    if (prop === 'state') return core.state;
                    const val = (target as any)[prop];
                    if (val === void 0) {
                        // ...
                    }
                    return val;
                },
                set(target, prop, value) {
                    if (prop === 'state') core.state = value;
                    else (target as any)[prop] = value;
                    return true;
                },
            },
        ) as any;
    }

    public activate(
        data: any,
        controlInfo: Node.NodeControlInfo,
    ): void | Promise<void> {
        // Node is activated

        const actID = localCounters.allocateNodeActID();
        let stage = Node.NodeWorkingStage.NodeWillRun;

        let prevented = false;

        // prettier-ignore
        // Trigger event `NodeWillRun`
        const asapResult = Asap.tryCatch(
            () => {
                const handlers: undefined | Node.NodeEvent.NodeWillRun<this>[] =
                    this.core.eventHandlers[
                        Node.LocalNodeEventType.NodeWillRun
                    ] as any;

                if (!handlers || handlers.length === 0) return;

                const args: Node.NodeEvent.NodeWillRunArgs = {
                    data,
                    controlInfo,
                    preventRunning: () => {
                        prevented = true;
                    },
                };
                const check = () => !prevented;
                return Asap.execFunctionsAndCheck(check, handlers, this, args);
            },
            (e) => {
                this.emitNodeThrowError(false, {
                    node: this,
                    error: e,
                    stage,
                    controlInfo,
                });
            },
        )
        // Trigger event `NodeRun`
        .thenTryCatch(
            () => {
                if (prevented) return Asap.cancelToken;

                stage = Node.NodeWorkingStage.NodeIsRunning;

                const nodeRunConsole: Node.NodeRunConsole<LocalNode<S, P>> =
                    Object.create(this.nodeRunConsolePrototype);
                (nodeRunConsole as any).entry = new NodeRunConsoleEntry(
                    controlInfo.port.name,
                );
                return (this.core as NodeCore<S, P>).onrun.call(nodeRunConsole, data);
            },
            (e) => {
                this.emitNodeThrowError(false, {
                    node: this,
                    error: e,
                    stage: Node.NodeWorkingStage.NodeIsRunning,
                    controlInfo,
                });
            },
        )
        // Trigger event `NodeDidRun`
        .thenTryCatch(
            () => {
                // ...
            },
            (e) => {
                // ...
            },
        )
        // Node is deactivated
        .thenTryCatch(
            () => {
                // ...
            },
            (e) => {
                // ...
            },
        )
        .result;

        if (isPromise(asapResult)) {
            return asapResult.then(noop);
        }
    }

    // protected emitNodeWillRun(
    //     check: () => void,
    //     args: Node.NodeEvent.NodeWillRunArgs,
    // ): void | Promise<void> {}

    protected emitNodeThrowError(
        fromChild: boolean,
        nodeError: Node.NodeError,
    ): void {
        // ...
    }
}

merge(LocalNode.prototype, {
    type: ElementType.LocalNode,
    domain: LocalDomain,
    isSubnet: false,
});
