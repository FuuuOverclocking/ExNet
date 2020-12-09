import { ElementType, NetLinkOwnership, Node } from './types';
import { merge } from './utilities';

export class Net {
    public readonly type!: ElementType.Net;
    public parent: Node.ParentType = void 0;
    public nodes: Set<Node> = new Set<Node>();
    public linkOwnership: NetLinkOwnership = void 0;
}

merge(Net.prototype, {
    type: ElementType.Net,
});
