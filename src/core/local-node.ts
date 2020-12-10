import { ElementType, ExLocalPortSet, LocalDomain, LocalGroup, Net, Node } from './types';
import { It } from './utilities';

export interface LocalNode<S, P extends object> extends Node {
    readonly type: ElementType.PrimaryNode | ElementType.Subnet;
    readonly surfaceNode: any;
    readonly rawNode: LocalNode<S, P>;

    readonly nid: number;
    readonly domain: LocalDomain;
    brand: string;

    readonly groups: LocalGroup[];

    net: Net;
    readonly parent: Node.ParentType;

    readonly ports: ExLocalPortSet<P>;
    readonly portsState: Node.PortsState<P>;

    state: S;

    // throwError(nodeError: Node.NodeError): void;
}

export namespace LocalNode {
    export function proxify(node: LocalNode<any, any>): void {
        if (typeof node.surfaceNode !== 'undefined') return;

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const host: { n: LocalNode<any, any> } = () => {};

        // Do not refer to `node` directly in order to avoid creating closures.
        host.n = node;

        (node as any).surfaceNode = new Proxy(host, {
            apply(host, thisArg, args) {
                host.n.ports.$I.input(args[0]);
            },
            get(host, prop) {
                if (It.isPortName(prop)) return host.n.ports.get(prop);
                return Reflect.get(host.n, prop);
            },
            set: (host, prop, value) => Reflect.set(host.n, prop, value),
            has: (host, prop) => Reflect.has(host.n, prop),
            deleteProperty: (host, prop) => Reflect.deleteProperty(host.n, prop),
            ownKeys: (host) => Reflect.ownKeys(host.n),
            getOwnPropertyDescriptor: (host, prop) =>
                Reflect.getOwnPropertyDescriptor(host.n, prop),
            defineProperty: (host, prop, descriptor) =>
                Reflect.defineProperty(host.n, prop, descriptor),
            preventExtensions: () => false,
            isExtensible: () => true,
            setPrototypeOf: () => false,
        });
    }

    export class NodeRunConsoleEntry {
        constructor(public name: string) {
            (this as any)[name] = true;
        }
        public is(portName: string): boolean {
            return portName === this.name;
        }
    }
}
