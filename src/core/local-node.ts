import { Node } from './types';
type DP = Node.DefaultPorts;

export class LocalNode<S = any, P extends object = DP> implements Node {
    public readonly domain = {} as any;
    public readonly isSubnet!: boolean;
}
