import { ElementType, Node, Port, Subnet } from './types';
import { EventEmitter, merge } from './utilities';
import { log } from './debug';
import { LocalDomain } from './local-domain';
import { Net } from './net';
import { ExLocalPortSet, LocalPortSet } from './local-port-set';

export class SubnetCore<S, P extends object> extends EventEmitter<Node.SubnetEvents<Subnet<S, P>>> {
    public readonly type!: ElementType.SubnetCore; // defined on prototype
    public readonly domain!: LocalDomain; // defined on prototype
    public brand!: string; // defined on prototype

    public readonly shells = new WeakSet<Subnet<S, P>>();
    public readonly corePortsState: Node.CorePortsState<P> = {};

    public state: S;
    public readonly onrun: Node.Event.SubnetRun<Subnet<S, P>>;

    constructor(
        state: S,
        define: Node.SubnetDefine<S, P>,
        onrun?: Node.Event.SubnetRun<Subnet<S, P>>,
    ) {
        super(EventEmitter.HandlerQueueType.PriorityQueue);

        this.state = state;
        // define (...)
        this.onrun = onrun || ((data, runNet) => runNet());
    }

    public readonly subnet = new Net();
    public readonly children = this.subnet.nodes;
    public readonly innerPorts: ExLocalPortSet<P> = new LocalPortSet(
        Port.Side.Inner,
        this,
        void 0,
    ) as any;

    public addShell(shell: Subnet<S, P>): void {
        this.shells.add(shell);
    }

    public setCorePortsState(
        portName: keyof P,
        direction: Port.Direction | undefined,
        innerLinkNum: number | undefined,
    ): void {
        const { corePortsState } = this;

        if (!corePortsState[portName]) {
            direction ??= Port.Direction.Unknown;
            innerLinkNum ??= 0;
            corePortsState[portName] = {
                direction,
                innerLinkNum,
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
        if (innerLinkNum !== void 0 && innerLinkNum !== portState.innerLinkNum) {
            portState.innerLinkNum = innerLinkNum;
            this.emit(
                'corePortsStateChange',
                this,
                portName as string,
                Node.Event.CorePortsStateChangeAction.ChangeInnerLinkNum,
            );
            return;
        }
    }
}

merge(SubnetCore.prototype, {
    type: ElementType.SubnetCore,
    domain: LocalDomain,
    brand: 'SubnetCore',
});
