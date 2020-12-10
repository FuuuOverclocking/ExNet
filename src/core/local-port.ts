import { ElementType, LocalNode, Node, NodeCore, Port, SubnetCore } from './types';
import { merge } from './utilities';
import { log } from './debug';

function getTransferDirection(dir: Port.Direction, side: Port.Side): Port.Direction {
    return dir === Port.Direction.Unknown ? Port.Direction.Unknown : side ^ dir;
}

export class LocalPort<T> {
    public readonly type!: ElementType.LocalPort; // defined on prototype
    public readonly name: string;
    public readonly side: Port.Side;
    public readonly core: NodeCore<any, any> | SubnetCore<any, any>;
    public readonly node?: LocalNode<any, any>;
    public direction: Port.Direction;
    public transferDirection: Port.Direction;

    public readonly links: Port[];

    constructor(
        name: string,
        core: NodeCore<any, any> | SubnetCore<any, any>,
        node: LocalNode<any, any> | undefined,
        side: Port.Side,
        direction: Port.Direction,
    ) {
        this.name = name;
        this.side = side;
        this.core = core;
        this.node = node;
        this.transferDirection = this.direction = Port.Direction.Unknown;
        this.links = [];

        this.setDirection(direction, false);
        core.setCorePortsState(name, this.direction);
    }

    public setDirection(dir: Port.Direction, notifyCore = true): void {
        dir = this.checkOrResolveDirection(dir);

        if (dir === this.direction) return;

        this.direction = dir;
        this.transferDirection = getTransferDirection(dir, this.side);

        if (notifyCore) {
            this.core.setCorePortsState(this.name, this.direction);
        }
    }

    private checkOrResolveDirection(dir: Port.Direction): Port.Direction {
        const { name, core, direction } = this;

        if (dir === Port.Direction.Unknown) {
            if (name === '$E') return Port.Direction.Out;
            if (name === '$IE') return Port.Direction.In;
            const coreState = core.corePortsState[name];
            if (coreState !== void 0) return coreState.direction;
            return direction;
        }

        if (name === '$E' && dir === Port.Direction.In) {
            log.error('The direction of port "$E" can only be Out.');
            throw new Error();
        }
        if (name === '$IE' && dir === Port.Direction.Out) {
            log.error('The direction of port "$IE" can only be In.');
            throw new Error();
        }

        const coreDir = core.corePortsState[name]?.direction;
        if (coreDir !== void 0 && coreDir !== Port.Direction.Unknown && dir !== coreDir) {
            log.withNC.error(
                `The direction of port "${name}" is different` +
                    ` from the port state of the node core.`,
                this.node || this.core,
            );
            throw new Error();
        }

        if (direction !== Port.Direction.Unknown && direction !== dir) {
            log.withNC.error(
                `Cannot change the direction of port "${name}" ` +
                    `as its direction has already been determined.`,
                this.node || this.core,
            );
            throw new Error();
        }
    }

    public input(data: T, controlInfo?: Node.ControlInfo): void {
        // ...
    }

    public output(data: T, controlInfo?: Node.ControlInfo): void {
        // ...
    }
}

merge(LocalPort.prototype, {
    type: ElementType.LocalPort,
});
