import { Node, Port } from './types';
import { EventEmitter, merge } from './utilities';
import { log } from './debug';
import { LocalDomain } from './local-domain';
import { LocalNode } from './local-node';

export class NodeCore<S, P extends object> extends EventEmitter<
    Node.LocalNodeEventType<LocalNode<S, P>>
> {
    public readonly domain!: LocalDomain; // defined on prototype
    public brand!: string; // defined on prototype
    public readonly isSubnet!: false; // defined on prototype

    public readonly shells = new WeakSet<LocalNode<S, P>>();
    public readonly corePortsState: Node.CorePortsState<P> = {};

    public state: S;
    public readonly onrun: Node.Event.NodeRun<LocalNode<S, P>>;

    constructor(state: S, onrun: Node.Event.NodeRun<LocalNode<S, P>>) {
        super(EventEmitter.HandlerQueueType.PriorityQueue);

        this.state = state;
        this.onrun = onrun;
    }

    public addShell(shell: LocalNode<S, P>): void {
        this.shells.add(shell);
    }

    public setCorePortsState(
        portName: keyof P,
        direction: Port.Direction | undefined,
    ): void {
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
                        `whose direction has already been determined.`,
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
    domain: LocalDomain,
    brand: 'NodeCore',
    isSubnet: false,
});
