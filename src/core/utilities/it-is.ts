import { ElementType, NodeCore, SubnetCore } from 'core/types';

export namespace It {
    export function isCore(value: any): value is NodeCore<any, any> | SubnetCore<any, any> {
        return (
            value && (value.type === ElementType.NodeCore || value.type === ElementType.SubnetCore)
        );
    }
    export function isNodeCore(value: any): value is NodeCore<any, any> {
        return value && value.type === ElementType.NodeCore;
    }
    export function isSubnetCore(value: any): value is SubnetCore<any, any> {
        return value && value.type === ElementType.SubnetCore;
    }

    export function isPromise(value: any): value is Promise<any> {
        return value instanceof Promise;
    }

    export function isPortName(value: any): value is string {
        return typeof value === 'string' && value[0] === '$' && value.length !== 1;
    }
}
