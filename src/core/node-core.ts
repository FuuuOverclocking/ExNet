import { log } from './debug';
import { AnyFunction, ElementType, LocalNode, Node } from './types';
import { merge, nodeEventNameToType, PriorityQueue } from './utilities';
import { LocalDomain } from './local-domain';

export class NodeCore<S, P extends object> {
    public readonly type!: ElementType.NodeCore;

    public readonly shells = new WeakSet<LocalNode<S, P>>();

    public readonly domain!: LocalDomain;
    public brand!: string;
    public readonly isSubnet!: false;

    public readonly eventHandlers: Array<
        PriorityQueue<Node.Event.EventHandler>
    > = new Array(Node.Event.LocalNodeEventType.NumberOfEventTypes);

    constructor(
        public state: S,
        public readonly onrun: Node.Event.NodeRun<LocalNode<S, P>>,
    ) {}

    public addShell(shell: LocalNode<S, P>): void {
        this.shells.add(shell);
    }

    public on(event: string | number, handler: AnyFunction): void {
        if (typeof event === 'string') {
            event = nodeEventNameToType(event) ?? -1;
        }

        if (
            event === Node.Event.LocalNodeEventType.NodeWillInnerPipe ||
            event === Node.Event.LocalNodeEventType.NodeDidInnerPipe ||
            event === Node.Event.LocalNodeEventType.NodeDidInnerUnpipe ||
            event < 0 ||
            event >= Node.Event.LocalNodeEventType.NumberOfEventTypes ||
            !Number.isInteger(event)
        ) {
            log.withNC.error('Invalid event type.', this, 'NodeCore.on()');
            throw new Error();
        }

        if (typeof (handler as any).priority === 'undefined') {
            (handler as any).priority = Node.Event.EventPriority.Normal;
        }
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = new PriorityQueue();
        }
        this.eventHandlers[event].enqueue(
            (handler as any) as Node.Event.EventHandler,
        );
    }
}

merge(NodeCore.prototype, {
    type: ElementType.NodeCore,
    domain: LocalDomain,
    brand: 'NodeCore',
    isSubnet: false,
});
