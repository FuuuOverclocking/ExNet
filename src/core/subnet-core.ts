import { log } from './debug';
import { ElementType, LocalSubnet, Node } from './types';
import { merge, PriorityQueue } from './utilities';
import { LocalDomain } from './local-domain';

export class SubnetCore<S, P extends object> {
    public readonly type!: ElementType.SubnetCore;

    public readonly shells = new WeakSet<LocalSubnet<S, P>>();

    public readonly domain!: LocalDomain;
    public brand!: string;
    public readonly isSubnet!: true;

    public readonly eventHandlers: Array<
        PriorityQueue<Node.NodeEventHandler>
    > = new Array(Node.LocalNodeEventType.NumberOfEventTypes);

    constructor(
        public state: S,
        public readonly onrun: Node.Event.NodeRun<LocalSubnet<S, P>>,
    ) {}

    public addShell(shell: LocalSubnet<S, P>): void {
        this.shells.add(shell);
    }

    public on(event: Node.LocalNodeEventType, handler: Function): void {
        if (
            !Number.isInteger(event) ||
            event < 0 ||
            event >= Node.LocalNodeEventType.NumberOfEventTypes
        ) {
            log.withNC.error('Invalid event type.', this, 'SubnetCore.on()');
            throw new Error();
        }

        if (typeof (handler as any).priority === 'undefined') {
            (handler as any).priority = Node.NodeEventPriority.Normal;
        }
        this.eventHandlers[event].enqueue(handler as Node.NodeEventHandler);
    }
}

merge(SubnetCore.prototype, {
    type: ElementType.SubnetCore,
    domain: LocalDomain,
    brand: 'SubnetCore',
    isSubnet: true,
});
