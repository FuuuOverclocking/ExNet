import { log } from './debug';
import { ElementType, LocalNode, Node } from './types';
import { merge, PriorityQueue } from './utilities';
import { LocalDomain } from './local-domain';

export class NodeCore<S, P extends object> {
    public readonly type!: ElementType.NodeCore;

    public readonly shells = new WeakSet<LocalNode<S, P>>();

    public readonly domain!: LocalDomain;
    public brand!: string;
    public readonly isSubnet!: false;

    public readonly eventHandlers: Array<
        PriorityQueue<Node.NodeEventHandler>
    > = new Array(Node.LocalNodeEventType.NumberOfEventTypes);

    constructor(
        public state: S,
        public readonly onrun: Node.NodeEvent.NodeRun<LocalNode<S, P>>,
    ) {}

    public addShell(shell: LocalNode<S, P>): void {
        this.shells.add(shell);
    }

    public on(event: Node.LocalNodeEventType, handler: Function): void {
        if (
            event === Node.LocalNodeEventType.NodeWillInnerPipe ||
            event === Node.LocalNodeEventType.NodeDidInnerPipe ||
            event === Node.LocalNodeEventType.NodeDidInnerUnpipe ||
            !Number.isInteger(event) ||
            event < 0 ||
            event >= Node.LocalNodeEventType.NumberOfEventTypes
        ) {
            log.withNC.error('Invalid event type.', this, 'NodeCore.on()');
            throw new Error();
        }

        if (typeof (handler as any).priority === 'undefined') {
            (handler as any).priority = Node.NodeEventPriority.Normal;
        }
        this.eventHandlers[event].enqueue(handler as Node.NodeEventHandler);
    }
}

merge(NodeCore.prototype, {
    type: ElementType.NodeCore,
    domain: LocalDomain,
    brand: 'NodeCore',
    isSubnet: false,
});
