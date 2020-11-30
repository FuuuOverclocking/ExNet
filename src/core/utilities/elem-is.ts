import { ElementType, NodeCore, SubnetCore } from '../types';

export namespace Elem {
    export function isCore(
        value: any,
    ): value is NodeCore<any, any> | SubnetCore<any, any> {
        return (
            value &&
            (value.type === ElementType.NodeCore ||
                value.type === ElementType.SubnetCore)
        );
    }
    export function isNodeCore(value: any): value is NodeCore<any, any> {
        return value && value.type === ElementType.NodeCore;
    }
    export function isSubnetCore(value: any): value is SubnetCore<any, any> {
        return value && value.type === ElementType.SubnetCore;
    }
}
