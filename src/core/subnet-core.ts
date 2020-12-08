import { LocalSubnet, Node, Port } from './types';
import { EventEmitter, merge } from './utilities';
import { log } from './debug';
import { LocalDomain } from './local-domain';

export class SubnetCore<S, P extends object> extends EventEmitter<
    Node.LocalSubnetEventType<LocalSubnet<S, P>>
> {
    public readonly domain!: LocalDomain; // defined on prototype
    public brand!: string; // defined on prototype
    public readonly isSubnet!: true; // defined on prototype

    public readonly shells = new WeakSet<LocalSubnet<S, P>>();
    public readonly corePortsState: Node.CorePortsState<P> = {};

    public state: S;
    public readonly onrun: Node.Event.SubnetRun<LocalSubnet<S, P>>;

    constructor(state: S, onrun: Node.Event.SubnetRun<LocalSubnet<S, P>>) {
        super(EventEmitter.HandlerQueueType.PriorityQueue);

        this.state = state;
        this.onrun = onrun;
    }

    public addShell(shell: LocalSubnet<S, P>): void {
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
        if (
            innerLinkNum !== void 0 &&
            innerLinkNum !== portState.innerLinkNum
        ) {
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
    domain: LocalDomain,
    brand: 'SubnetCore',
    isSubnet: true,
});
