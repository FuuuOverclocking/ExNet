import { Dictionary, ElementType, ExNode, LocalGroup, Node } from './types';
import { Asap, It, merge, noop } from './utilities';
import { log } from './debug';
import { LocalDomain } from './local-domain';
import { NodeCore } from './node-core';
import { SubnetCore } from './subnet-core';
import { Net } from './net';

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

    public readonly rawNode!: LocalNode<S, P>;
    public readonly proxiedNode!: ExNode<S, P>;

    protected static proxify(node: LocalNode<any, any>): void {
        if (node.proxiedNode as any) return;

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const host: { n: LocalNode<any, any> } = () => {};

        // Do not refer to `node` directly in order to avoid creating closures.
        host.n = node;

        (node as any).proxiedNode = new Proxy(host, {
            apply(host, thisArg, args) {
                host.n.ports.$I.input(args[0]);
            },
            get(host, prop) {
                if (It.isPortName(prop)) return host.n.ports.get(prop);
                return Reflect.get(host.n, prop);
            },
            set: (host, prop, value) => Reflect.set(host.n, prop, value),
            has: (host, prop) => Reflect.has(host.n, prop),
            deleteProperty: (host, prop) =>
                Reflect.deleteProperty(host.n, prop),
            ownKeys: (host) => Reflect.ownKeys(host.n),
            getOwnPropertyDescriptor: (host, prop) =>
                Reflect.getOwnPropertyDescriptor(host.n, prop),
            defineProperty: (host, prop, descriptor) =>
                Reflect.defineProperty(host.n, prop, descriptor),
            preventExtensions: () => false,
            isExtensible: () => true,
            setPrototypeOf: () => false,
        });
    }

    public readonly core!: NodeCore<S, P> | SubnetCore<S, P>;

    /* Identification */
    public readonly nid!: number;
    public readonly domain!: LocalDomain;
    public get brand(): string {
        return this.core.brand;
    }
    public set brand(value: string) {
        this.core.brand = value;
    }
    public readonly isSubnet!: boolean;

    /* Group information */
    public readonly groups!: LocalGroup[];

    /* Topology */
    public net!: Net;
    public get parent(): Node.ParentType {
        return this.net.parent;
    }
    public readonly ports!: any;
    public readonly portsState!: Node.PortsState<P>;

    /* State */
    public get state(): S {
        return this.core.state;
    }
    public set state(value: S) {
        this.core.state = value;
    }

    /* Events */
    public on(event: number | string, handler: AnyFunction): void {
        this.core.on(event, handler);
    }

    protected nodeRunConsolePrototypeRaw!: {
        node: ExNode<S, P>;
        __RawNode__: LocalNode<S, P>;
    } & Dictionary<(data: any) => void>;
    protected nodeRunConsolePrototype!: {
        node: ExNode<S, P>;
        __RawNode__: LocalNode<S, P>;
        state: S;
    } & Dictionary<(data: any) => void>;

    /** The call signature without parameters is only used for inheritance of LocalSubnet. */
    constructor();
    constructor(core: NodeCore<S, P>);
    constructor(state: S, onrun: Node.Event.NodeRun<LocalNode<S, P>>);
    constructor(state?: any, onrun?: any) {
        if (It.isNodeCore(state)) {
            this.initNode(state);
        } else if (typeof onrun !== 'undefined') {
            this.initNode(new NodeCore(state, onrun));
        }
    }

    private initNode(core: NodeCore<S, P>): void {
        (this as any).rawNode = this;
        LocalNode.proxify(this);

        (this as any).core = core;

        (this as any).nid = localCounters.allocateNodeNid();
        (this as any).groups = [];

        this.net = new Net();
        this.net.nodes.add(this);
        (this as any).ports = {}; ///////////
        (this as any).portsState = {};

        core.on(
            LocalNode.EventType.CorePortsStateChange,
            (
                portName: string,
                action: Node.Event.CorePortsStateChangeAction,
            ) => {
                const state = core.corePortsState[portName as keyof P];
                if (action === Node.Event.CorePortsStateChangeAction.Create) {
                    this.portsState[portName as keyof P] = {
                        direction: state!.direction,
                        outerLinkNum: 0,
                        innerLinkNum: 0,
                    };
                    this.emitNodePortsStateChange(
                        portName,
                        Node.Event.NodePortsStateChangeAction.Create,
                    );
                    return;
                }
                if (
                    action ===
                    Node.Event.CorePortsStateChangeAction.DetermineDirection
                ) {
                    this.portsState[
                        portName as keyof P
                    ]!.direction = state!.direction;
                    const port = this.ports[portName as keyof P];
                    if (port) port.setDirection(state!.direction, false);
                    this.emitNodePortsStateChange(
                        portName,
                        Node.Event.NodePortsStateChangeAction
                            .DetermineDirection,
                    );
                    return;
                }

                log.error(`Unexpected CorePortsStateChangeAction: ${action}`);
                throw new Error();
            },
        );

        this.nodeRunConsolePrototypeRaw = {
            node: this.proxiedNode,
            __RawNode__: this,
            // [portName in keyof P]: (data: any) => void
        } as any;
        this.nodeRunConsolePrototype = new Proxy(
            this.nodeRunConsolePrototypeRaw,
            {
                get(target, prop) {
                    if (prop === 'state') return target.__RawNode__.core.state;
                    let val = Reflect.get(target, prop);
                    if (val === void 0 && It.isPortName(prop)) {
                        target.__RawNode__.ports.get(prop);
                        val = Reflect.get(target, prop);
                        // 创建端口, { name: prop, direction: Out }
                        // 触发 NodePortsStateChange
                        // 在 nodeRunConsolePrototypeRaw 中增加 [prop]: function() {}
                        // val = ...
                    }
                    return val;
                },
                set(target, prop, value) {
                    if (prop === 'state') {
                        target.__RawNode__.core.state = value;
                        return true;
                    } else return false;
                },
            },
        ) as any;

        core.addShell(this);
    }

    public activate(
        data: any,
        controlInfo: Node.ControlInfo,
    ): void | Promise<void> {
        // Node is activated

        // `this` may point to the proxied node, which will add overhead during
        // the access to the node.
        const me = this.rawNode;

        const actID = localCounters.allocateNodeActID();
        let stage = Node.WorkingStage.NodeWillRun;

        let prevented = false;

        // prettier-ignore
        // Trigger event `NodeWillRun`
        const asapResult = Asap.tryCatch(
            () => {
                const handlers: undefined | Node.Event.NodeWillRunHandler<this>[] =
                    me.core.eventHandlers[
                        Node.Event.LocalNodeEventType.NodeWillRun
                    ] as any;

                if (!handlers || handlers.length === 0) return;

                const arg: Node.Event.NodeWillRunArgument = {
                    data,
                    controlInfo,
                    preventRunning: () => {
                        prevented = true;
                    },
                };
                const check = () => !prevented;
                return Asap.execFunctionsAndCheck(
                    check,
                    handlers,
                    me.proxiedNode,
                    arg,
                );
            },
            (e) => {
                me.onNodeThrowError(false, {
                    node: me.proxiedNode,
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

                stage = Node.WorkingStage.NodeIsRunning;

                const nodeRunConsole: Node.NodeRunConsole<LocalNode<S, P>> =
                    Object.create(me.nodeRunConsolePrototype);
                Object.defineProperties(nodeRunConsole, {
                    entry: {
                        configurable: true,
                        enumerable: true,
                        value: new NodeRunConsoleEntry(controlInfo.port.name),
                        writable: false,
                    },
                    __ControlInfo__: {
                        configurable: true,
                        enumerable: true,
                        value: controlInfo,
                        writable: false,
                    },
                });
                
                return (me.core as NodeCore<S, P>).onrun.call(nodeRunConsole, data);
            },
            (e) => {
                me.onNodeThrowError(false, {
                    node: me.proxiedNode,
                    error: e,
                    stage,
                    controlInfo,
                });
            },
        )
        // Trigger event `NodeDidRun`
        .thenTryCatch(
            () => {
                stage = Node.WorkingStage.NodeDidRun;

                const handlers: undefined | Node.Event.NodeDidRunHandler<this>[] =
                    me.core.eventHandlers[
                        Node.Event.LocalNodeEventType.NodeDidRun
                    ] as any;

                if (!handlers || handlers.length === 0) return;

                const arg: Node.Event.NodeDidRunArgument = {
                    data,
                    controlInfo,
                };
                return Asap.execFunctions(handlers, me.proxiedNode, arg);
            },
            (e) => {
                me.onNodeThrowError(false, {
                    node: me.proxiedNode,
                    error: e,
                    stage,
                    controlInfo,
                });
            },
        )
        // Node is deactivated
        .thenTryCatch(
            () => {
                stage = Node.WorkingStage.NodeStopped;
            },
            noop,
        )
        .result;

        if (It.isPromise(asapResult)) {
            return asapResult.then(noop);
        }
    }

    protected onNodeThrowError(
        fromChild: boolean,
        nodeError: Node.NodeError,
    ): void {
        const me = this.rawNode;

        // prettier-ignore
        const handlers: undefined | Node.Event.NodeThrowErrorHandler<this>[] =
            me.core.eventHandlers[Node.Event.LocalNodeEventType.NodeThrowError] as any;

        if (handlers) {
            for (const handler of handlers) {
                const isCatched = handler.call(
                    me.proxiedNode,
                    fromChild,
                    nodeError,
                );
                if (isCatched) return;
            }
        }

        if ((me as any).portsState.$E?.outerLinkNum) {
            // 输出 nodeError 到 $E
            return;
        }

        if (me.net.parent) {
            me.net.parent.emitNodeThrowError();
            return;
        }

        LocalDomain.throwUncaughtNodeError(nodeError);
    }

    private emitNodePortsStateChange(
        portName: string,
        action: Node.Event.NodePortsStateChangeAction,
    ): void {
        const handlers = this.core.eventHandlers[
            LocalNode.EventType.NodePortsStateChange
        ] as Node.Event.NodePortsStateChangeHandler<this>[] | undefined;

        if (!handlers || !handlers.length) return;

        for (const handler of handlers) {
            handler.call(this.proxiedNode, portName, action);
        }
    }
}

merge(LocalNode.prototype, {
    type: ElementType.LocalNode,
    domain: LocalDomain,
    isSubnet: false,
});
