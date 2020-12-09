import { ElementType, Node } from './types';
import { merge } from './utilities';

export class RemoteNode implements Node {
    public readonly type!: ElementType.RemoteNode; // defined on prototype
}

merge(RemoteNode.prototype, {
    type: ElementType.RemoteNode,
});
