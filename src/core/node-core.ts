import { Node, PrimaryNode, Port, ElementType } from './types';
import { EventEmitter, merge } from './utilities';
import { log } from './debug';
import { LocalDomain } from './local-domain';

export class NodeCore<S, P extends object> extends EventEmitter<
    Node.PrimaryNodeEvents<PrimaryNode<S, P>>
> {
    public readonly type!: ElementType.NodeCore; // defined on prototype
    public readonly domain!: LocalDomain; // defined on prototype
    public brand!: string; // defined on prototype

    public readonly shells = new WeakSet<PrimaryNode<S, P>>();
    public readonly corePortsState: Node.CorePortsState<P> = {};

    public state: S;
    public readonly onrun: Node.Event.PrimaryNodeRun<PrimaryNode<S, P>>;

    constructor(state: S, onrun: Node.Event.PrimaryNodeRun<PrimaryNode<S, P>>) {
        super(EventEmitter.HandlerQueueType.PriorityQueue);

        this.state = state;
        this.onrun = onrun;
    }

    public addShell(shell: PrimaryNode<S, P>): void {
        this.shells.add(shell);
    }

    public setCorePortsState(portName: keyof P, direction: Port.Direction | undefined): void {
        const { corePortsState } = this;

        if (!corePortsState[portName]) {
            direction ??= Port.Direction.Unknown;
            corePortsState[portName] = {
                direction,
                innerLinkNum: 0,
            };
            this.emit(
                'corePortsStateChange',
                this,
                portName as string,
                Node.Event.CorePortsStateChangeAction.Create,
            );
            return;
        }

        const portState = corePortsState[portName]!;
        if (direction !== void 0 && direction !== portState.direction) {
            if (portState.direction !== Port.Direction.Unknown) {
                log.withNC.error(
                    `Cannot change the direction of port "${portName}" ` +
                        `as its direction has already been determined.`,
                    this,
                    'NodeCore.setCorePortsState()',
                );
                throw new Error();
            }

            portState.direction = direction;
            this.emit(
                'corePortsStateChange',
                this,
                portName as string,
                Node.Event.CorePortsStateChangeAction.DetermineDirection,
            );
            return;
        }
    }
}

merge(NodeCore.prototype, {
    type: ElementType.NodeCore,
    domain: LocalDomain,
    brand: 'ExNode',
});
