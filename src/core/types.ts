import type {
    getPortsOfLocalNode,
    getStateOfLocalNode,
    extractTypeFromPortTypeDescriptor,
    Dictionary,
    AnyFunction,
} from './utility-types';
export * from './utility-types';

export interface Domain {
    /** Domain ID uniquely identifies a domain among interconnected domains. */
    readonly id: string;
    /** Every time the program re-runs, `runID` is randomly generated. */
    readonly runID: string;
    readonly isLocal: boolean;
}

export namespace Domain {
    export namespace Event {
        export const enum LocalDomainEventType {
            UncaughtNodeError = 0,

            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            NumberOfEventTypes = 1,
        }
        /**
         * Event handler for uncaught node error.
         * @returns Whether the error is caught and properly handled.
         */
        export type UncaughtNodeErrorHandler = (
            this: LocalDomain,
            nodeError: Node.NodeError,
        ) => boolean;
    }
}

import type { LocalDomain } from './local-domain';
import type { RemoteDomain } from './remote-domain';
export type { LocalDomain, RemoteDomain };

export interface Group {
    readonly domain: Domain;
    readonly gid: number;
}

import type { LocalGroup } from './local-group';
import type { RemoteGroup } from './remote-group';
export type { LocalGroup, RemoteGroup };

export const enum ElementType {
    NodeCore,
    SubnetCore,
    LocalNode,
    LocalSubnet,
    RemoteNode,
    VirtualNode,
    UnknownNode,
    LocalPort,
    RemotePort,
    VirtualPort,
}

// prettier-ignore
export type NodeLikeType =
    | ElementType.LocalNode
    | ElementType.LocalSubnet
    | ElementType.RemoteNode
    | ElementType.UnknownNode
    | ElementType.VirtualNode
    ;

// prettier-ignore
export type NodeType =
    | ElementType.LocalNode
    | ElementType.LocalSubnet
    | ElementType.RemoteNode
    | ElementType.UnknownNode
    ;

import type { NodeCore } from './node-core';
import type { SubnetCore } from './subnet-core';
export type { NodeCore, SubnetCore };

export interface NodeLike {
    readonly type: NodeLikeType;
}

export interface Node extends NodeLike {
    readonly type: NodeType;
}

import type { LocalNode } from './local-node';
import type { LocalSubnet } from './local-subnet';
import type { RemoteNode } from './remote-node';
import type { VirtualNode } from './virtual-node';
import type { UnknownNode } from './unknown-node';
export type { LocalNode, LocalSubnet, RemoteNode, VirtualNode, UnknownNode };

import type { LocalPort } from './local-port';
import type { RemotePort } from './remote-port';
import type { VirtualPort } from './virtual-port';

// prettier-ignore
export type ExNode<S, P extends object> =
    & LocalNode<S, P>
    & { (data: any): void | Promise<void> }
    & { [portName in keyof P]: LocalPort<P[portName]> }
    ;

export type ExPort<T = any, D = Port.PortIORole> = LocalPort<T, D>;

export namespace Node {
    export interface DefaultPorts<I, O> {
        $I: I;
        $O: O;
        $E: NodeError;
        [portName: string]: any;
    }

    export type PortsState<P extends object> = {
        [portName in keyof P]?: {
            direction: Port.PortIORole;
            outerLinkNum: number;
            /** If node is not a subnet, it is always 0. */
            innerLinkNum: number;
        };
    };

    export const enum WorkingStage {
        // Node is activated
        NodeWillRun,
        // Trigger event `NodeWillRun`
        NodeIsRunning,
        // Trigger event `NodeRun`
        NodeDidRun,
        // Trigger event `NodeDidRun`
        NodeStopped,
        // Node is deactivated
    }

    export interface NodeError {
        node: Node;
        error: Error;
        stage: WorkingStage;
        // dataSnapshot: any;
        controlInfo: ControlInfo;
    }

    export interface ControlInfo {
        port: Port;
        runStack?: any;
    }

    export type NodeRunConsole<N extends LocalNode<any, any>> = {
        readonly node: N['proxiedNode'];
        state: getStateOfLocalNode<N>;
        readonly entry: {
            readonly name: string;
            is(portName: string): boolean;
        } & {
            readonly [portName in keyof getPortsOfLocalNode<N>]:
                | true
                | undefined;
        };

        /** @internal */
        readonly __RawNode__: N;
        /** @internal */
        readonly __ControlInfo__: ControlInfo;
    } & {
        [portName in keyof getPortsOfLocalNode<N>]: (
            data: extractTypeFromPortTypeDescriptor<
                getPortsOfLocalNode<N>[portName]
            >,
        ) => void;
    };

    export interface Attr {
        name: string;
        events?: Dictionary<AnyFunction>;
    }

    export namespace Event {
        export interface EventHandler extends Function {
            fromAttr?: Attr;
            priority: number;
        }
        export const enum LocalNodeEventType {
            NodeWillPipe,
            NodeDidPipe,
            NodeDidUnpipe,
            NodeWillInnerPipe,
            NodeDidInnerPipe,
            NodeDidInnerUnpipe,
            NodeWillRun,
            NodeRun,
            NodeDidRun,
            NodeWillOutput,
            NodePortsStateChange,
            NodeDidBecomeChild,
            NodeDidGetChild,
            NodeStateChange,
            NodeThrowError,

            NumberOfEventTypes = 15,
        }

        export const enum RemoteNodeEventType {
            NodeDidPipe,
            NodeDidUnpipe,
            NodeDidBecomeChild,
            NodeWillRunNotice,
            NodeDidRunNotice,
            NodePortsStateChange,
            NodeStateChange,
            NodeGoOnline,
            NodeGoOffline,
            RemoteError,

            NumberOfEventTypes = 10,
        }

        // prettier-ignore
        export const enum EventPriority {
            SystemLow   =  0, //  0- 4
            Low         =  5, //  5- 9
            BelowNormal = 10, // 10-14
            Normal      = 15, // 15
            AboveNormal = 16, // 16-20
            High        = 21, // 21-25
            SystemHigh  = 26, // 26-31
        }

        export type NodeRun<N extends LocalNode<any, any>> = (
            this: NodeRunConsole<N>,
            data: any,
        ) => void | Promise<void>;

        export type SubnetRun<N extends LocalNode<any, any>> = (
            this: NodeRunConsole<N>,
            data: any,
            runNet: () => void,
        ) => void | Promise<void>;

        export interface NodeWillRunArgument {
            data: any;
            controlInfo: ControlInfo;
            preventRunning: () => void;
        }
        export interface NodeWillRunHandler<N extends LocalNode<any, any>>
            extends EventHandler {
            (
                this: N['proxiedNode'],
                arg: NodeWillRunArgument,
            ): void | Promise<void>;
        }

        export interface NodeDidRunArgument {
            data: any;
            controlInfo: ControlInfo;
        }
        export interface NodeDidRunHandler<N extends LocalNode<any, any>>
            extends EventHandler {
            (
                this: N['proxiedNode'],
                arg: NodeDidRunArgument,
            ): void | Promise<void>;
        }

        export interface NodeThrowErrorHandler<N extends LocalNode<any, any>>
            extends EventHandler {
            (this: N['proxiedNode'], fromChild: boolean, nodeError: NodeError):
                | void
                | boolean;
        }
    }
}

export namespace Port {
    export const enum PortIORole {
        // Determine the values to 0, 1 and 2 for
        // bit operation and array accessing.
        Out = 0,
        In = 1,
        Undetermined = 2,
    }
}
