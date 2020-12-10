import { LocalNode, NodeCore, Port, SubnetCore } from './types';
import { log } from './debug';
import { LocalPort } from './local-port';

export type ExLocalPortSet<P extends object> = LocalPortSet<P> &
    {
        readonly [K in keyof P]: LocalPort<P[K]>;
    };

export class LocalPortSet<P extends object> {
    constructor(
        private readonly side: Port.Side,
        private readonly core: NodeCore<any, P> | SubnetCore<any, P>,
        private readonly node?: LocalNode<any, P>,
    ) {}

    public get<K extends keyof P>(portName: K, direction?: Port.Direction): LocalPort<P[K]> {
        if (this.side === Port.Side.Outer && portName === '$IE') {
            log.withNC.error(
                'A node cannot have an outer port named "$IE".',
                this.node || this.core,
                'LocalPortSet.get()',
            );
            throw new Error();
        }

        const port = (this as any)[portName] as LocalPort<P[K]>;
        if (port) {
            if (direction !== void 0 && direction !== Port.Direction.Unknown) {
                port.setDirection(direction);
            }
            return port;
        }

        direction ??= Port.Direction.Unknown;
        return new LocalPort<P[K]>(portName as string, this.core, this.node, this.side, direction);
    }
}
