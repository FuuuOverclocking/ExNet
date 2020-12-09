import {
    Dictionary,
    ElementType,
    LocalGroup,
    Node,
    ExNode,
    Port,
} from './types';
import { Asap, It, merge, noop } from './utilities';
import { log } from './debug';
import { LocalDomain, localCounters } from './local-domain';
import { Net } from './net';
import { NodeCore } from './node-core';
import { LocalNode } from './local-node';
import { ExLocalPortSet, LocalPortSet } from './local-port-set';

export class PrimaryNode<S, P extends object> implements LocalNode<S, P> {
    public readonly type!: ElementType.PrimaryNode; // defined on prototype

    public readonly surfaceNode!: ExNode<S, P>;
    public readonly rawNode: PrimaryNode<S, P>;

    public readonly core: NodeCore<S, P>;

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
    public readonly portsState: Node.PortsState<P>;

    // prettier-ignore
    public get state(): S { return this.core.state }
    // prettier-ignore
    public set state(value: S) { this.core.state = value }

    private rawNodeRunConsolePrototype!: {
        node: ExNode<S, P>;
        __RawNode__: PrimaryNode<S, P>;
    } & Dictionary<(data: any) => void>;
    private nodeRunConsolePrototype!: {
        node: ExNode<S, P>;
        __RawNode__: PrimaryNode<S, P>;
        state: S;
    } & Dictionary<(data: any) => void>;

    constructor(core: NodeCore<S, P>);
    constructor(state: S, onrun: Node.Event.PrimaryNodeRun<PrimaryNode<S, P>>);
    constructor(state: any, onrun?: any) {
        if (It.isNodeCore(state)) {
            this.core = state;
        } else {
            this.core = new NodeCore(state, onrun);
        }

        this.rawNode = this;
        this.nid = localCounters.allocateNodeNid();
        this.groups = [];
        this.net = new Net();
        this.ports = new LocalPortSet<P>(
            Port.Side.Outer,
            this.core,
            this,
        ) as any;
        this.portsState = {};

        LocalNode.proxify(this); // set `this.surfaceNode`

        this.setupPortsAndNodeRunConsolePrototype();
        this.listenForCorePortsStateChange();

        this.net.nodes.add(this);
        this.core.addShell(this);
    }

    private setupPortsAndNodeRunConsolePrototype(): void {
        const { corePortsState } = this.core;

        this.rawNodeRunConsolePrototype = {
            node: this.surfaceNode,
            __RawNode__: this.rawNode,
        } as any;

        this.nodeRunConsolePrototype = new Proxy(
            this.rawNodeRunConsolePrototype,
            {
                get(target, prop) {
                    if (prop === 'state') return target.__RawNode__.core.state;

                    const val = Reflect.get(target, prop);
                    if (val !== void 0) return val;

                    if (It.isPortName(prop)) {
                        target.__RawNode__.ports.get(
                            prop as keyof P,
                            Port.Direction.Out,
                        );
                        // Then what happened here:
                        // 1. Let `p` be the outer port with the name %prop%.
                        // 2. If `p` exists and is an input port, an error is threw.
                        // 3. Otherwise, if `p` exists and is an output port,
                        //    then nothing happens.
                        // 4. Otherwise, if `p` not exists OR the direction of
                        //    `p` has not been determined, the port will be created
                        //    OR its direction will be determined to Out.
                        // 5. Event "corePortsStateChange" is emitted.
                        // 6. Call `this.addMethodToNodeRunConsole(%prop%)`.
                        return Reflect.get(target, prop);
                    }
                },
                set(target, prop, value) {
                    if (prop === 'state') {
                        target.__RawNode__.core.state = value;
                        return true;
                    } else return false;
                },
            },
        ) as any;

        for (const pn of Object.keys(corePortsState)) {
            const ps = corePortsState[pn as keyof P];
            if (!ps) continue;

            this.portsState[pn as keyof P] = {
                direction: ps.direction,
                outerLinkNum: 0,
                innerLinkNum: 0,
            };
            this.ports.get(pn as keyof P, ps.direction);
            if (ps.direction === Port.Direction.Out) {
                this.addMethodToNodeRunConsole(pn as keyof P);
            }
        }
    }

    /**
     * Listen for the event "corePortsStateChange", and synchronize the changes
     * to `ports`, `portsState` and `rawNodeRunConsolePrototype` of this node.
     */
    private listenForCorePortsStateChange(): void {
        const { core, rawNode: node } = this;

        const handler: Node.Event.CorePortsStateChangeHandler = (
            portName,
            action,
        ) => {
            const state = core.corePortsState[portName as keyof P]!;

            if (action === Node.Event.CorePortsStateChangeAction.Create) {
                node.portsState[portName as keyof P] = {
                    direction: state.direction,
                    outerLinkNum: 0,
                    innerLinkNum: 0,
                };
                this.ports.get(portName as keyof P, state.direction);
                if (state.direction === Port.Direction.Out) {
                    this.addMethodToNodeRunConsole(portName as keyof P);
                }

                core.emit(
                    'nodePortsStateChange',
                    this.surfaceNode,
                    portName,
                    Node.Event.NodePortsStateChangeAction.Create,
                );
                return;
            }

            if (
                action ===
                Node.Event.CorePortsStateChangeAction.DetermineDirection
            ) {
                node.portsState[portName as keyof P]!.direction =
                    state.direction;
                this.ports[portName as keyof P].setDirection(
                    state.direction,
                    false,
                );
                if (state.direction === Port.Direction.Out) {
                    this.addMethodToNodeRunConsole(portName as keyof P);
                }

                core.emit(
                    'nodePortsStateChange',
                    this.surfaceNode,
                    portName,
                    Node.Event.NodePortsStateChangeAction.DetermineDirection,
                );
                return;
            }

            log.withNC.error(
                `Unexpected CorePortsStateChangeAction: ${action}`,
                node,
                'PrimaryNode.listenForCorePortsStateChange()',
            );
            throw new Error();
        };
        handler.priority = Node.Event.EventPriority.SystemHigh;

        this.core.on('corePortsStateChange', handler);
    }

    /**
     * Add a function to the raw prototype of NodeRunConsole, so that users
     * could call `this.$foo(...)` in node body (assuming `portname` is `"$foo"`).
     */
    private addMethodToNodeRunConsole(portName: keyof P) {
        this.rawNodeRunConsolePrototype[portName as string] =
            this.rawNodeRunConsolePrototype[portName as string] ||
            function (
                this: Node.NodeRunConsole<PrimaryNode<S, P>>,
                data: any,
            ): void {
                this.__RawNode__.ports[portName].output(
                    data,
                    this.__ControlInfo__,
                );
            };
    }

    private getNodeRunConsole(
        entry: LocalNode.NodeRunConsoleEntry,
        controlInfo: Node.ControlInfo,
    ): Node.NodeRunConsole<PrimaryNode<S, P>> {
        const console: Node.NodeRunConsole<PrimaryNode<S, P>> = Object.create(
            this.nodeRunConsolePrototype,
        );
        Object.defineProperties(console, {
            entry: {
                configurable: true,
                enumerable: true,
                value: entry,
                writable: false,
            },
            __ControlInfo__: {
                configurable: true,
                enumerable: true,
                value: controlInfo,
                writable: false,
            },
        });
        return console;
    }

    public activate(
        data: any,
        controlInfo: Node.ControlInfo,
    ): void | Promise<void> {
        // Node is activated

        // `this` may point to the proxied node, which will add overhead during
        // the access to the node.
        const node = this.rawNode;
        const core = node.core;

        const actID = localCounters.allocateNodeActID();
        let stage = Node.WorkingStage.NodeWillRun;

        let prevented = false;

        // prettier-ignore
        // Trigger event `NodeWillRun`
        const asapResult = Asap.tryCatch(
            () => {
                const queue = core.eventHandlers.nodeWillRun;
                if (!queue || !queue.length) return;

                const arg: Node.Event.NodeWillRunArgument = {
                    data,
                    controlInfo,
                    preventRunning() { prevented = true },
                };
                const check = () => !prevented;
                return Asap.execFunctionsAndCheck(
                    check,
                    queue,
                    node.surfaceNode,
                    arg,
                );
            },
            (e) => {
                node.throwError({
                    node: node.surfaceNode,
                    error: e,
                    stage,
                    data,
                    controlInfo,
                });
            },
        )
        // Trigger event `NodeRun`
        .thenTryCatch(
            () => {
                if (prevented) return Asap.cancelToken;

                stage = Node.WorkingStage.NodeIsRunning;

                const console = node.getNodeRunConsole(
                    new LocalNode.NodeRunConsoleEntry(controlInfo.port!.name),
                    controlInfo,
                );
                return core.onrun.call(console, data);
            },
            (e) => {
                node.throwError({
                    node: node.surfaceNode,
                    error: e,
                    stage,
                    data,
                    controlInfo,
                });
            },
        )
        // Trigger event `NodeDidRun`
        .thenTryCatch(
            () => {
                stage = Node.WorkingStage.NodeDidRun;

                const queue = core.eventHandlers.nodeDidRun;
                if (!queue || !queue.length) return;

                const arg: Node.Event.NodeDidRunArgument = {
                    data,
                    controlInfo,
                };
                return Asap.execFunctions(queue, node.surfaceNode, arg);
            },
            (e) => {
                node.throwError({
                    node: node.surfaceNode,
                    error: e,
                    stage,
                    data,
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
            return asapResult.then(
                noop /* prevent the promise from giving Asap.cancelToken */,
            );
        }
    }

    private throwError(nodeError: Node.NodeError): void {
        const node = this.rawNode;
        const queue = node.core.eventHandlers.nodeThrowError;

        if (queue && queue.length) {
            for (const handler of queue) {
                const isCatched = handler.call(
                    node.surfaceNode,
                    false,
                    nodeError,
                );
                if (isCatched) return;
            }
        }

        if ((node.portsState as any).$E?.outerLinkNum) {
            (node.ports as any).$E.output(nodeError, {
                runStack: nodeError.controlInfo.runStack,
            });
            return;
        }

        if (node.net.parent) {
            node.net.parent.throwError(nodeError, true);
            return;
        }

        LocalDomain.throwUncaughtNodeError(nodeError);
    }

    public on<K extends keyof Node.PrimaryNodeEvents<PrimaryNode<S, P>>>(
        event: K,
        handler: Node.PrimaryNodeEvents<PrimaryNode<S, P>>[K],
    ): void {
        this.core.on(event, handler);
    }
    public off<K extends keyof Node.PrimaryNodeEvents<PrimaryNode<S, P>>>(
        event: K,
        handler: Node.PrimaryNodeEvents<PrimaryNode<S, P>>[K],
    ): void {
        this.core.off(event, handler);
    }
}

merge(PrimaryNode.prototype, {
    type: ElementType.PrimaryNode,
    domain: LocalDomain,
});
