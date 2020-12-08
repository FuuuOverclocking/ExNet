import { ElementType } from './types';
import { LocalNode } from './local-node';
import { SubnetCore } from './subnet-core';

export class LocalSubnet<S, P extends object> extends LocalNode<S, P> {
    public readonly type!: ElementType.LocalSubnet;
    public readonly core!: SubnetCore<S, P>;
    constructor() {
        super();
    }
}
