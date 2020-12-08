import { NetLinkOwnership, Node } from './types';

export class Net {
    public parent: Node.ParentType = void 0;
    public nodes: Set<Node> = new Set<Node>();
    public linkOwnership: NetLinkOwnership = void 0;
}
