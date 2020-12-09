import type {
    getPortsOfLocalNode,
    getStateOfLocalNode,
    Dictionary,
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
    export type LocalDomainEvents = {
        uncaughtNodeError: Event.UncaughtNodeErrorHandler;
    };

    export namespace Event {
        /**
         * Event handler for uncaught node error.
         * @returns whether the error is caught
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
    Net,
    NodeCore,
    SubnetCore,
    PrimaryNode,
    Subnet,
    RemoteNode,
    VirtualNode,
    UnknownNode,
    LocalPort,
    RemotePort,
    VirtualPort,
}

import type { Net } from './net';
export type { Net };

export type NetLinkOwnership =
    | undefined
    | {
          group: LocalGroup;
          domain?: RemoteDomain;
      };

import type { NodeCore } from './node-core';
import type { SubnetCore } from './subnet-core';
export type { NodeCore, SubnetCore };

// prettier-ignore
export type NodeLikeType =
    | ElementType.PrimaryNode
    | ElementType.Subnet
    | ElementType.RemoteNode
    | ElementType.UnknownNode
    | ElementType.VirtualNode
    ;

// prettier-ignore
export type NodeType =
    | ElementType.PrimaryNode
    | ElementType.Subnet
    | ElementType.RemoteNode
    | ElementType.UnknownNode
    ;

export interface NodeLike {
    readonly type: NodeLikeType;
}

export interface Node extends NodeLike {
    readonly type: NodeType;
}

import type { LocalNode } from './local-node';
import type { PrimaryNode } from './primary-node';
import type { Subnet } from './subnet';
import type { RemoteNode } from './remote-node';
import type { VirtualNode } from './virtual-node';
import type { UnknownNode } from './unknown-node';
export type {
    LocalNode,
    PrimaryNode,
    Subnet,
    RemoteNode,
    VirtualNode,
    UnknownNode,
};

// prettier-ignore
export type ProxiedNode<N> = N extends LocalNode<any, infer P>
    ? & N
      & { (data: any): void | Promise<void> }
      & { [portName in keyof P]: LocalPort<P[portName]> }
    : never;

// prettier-ignore
export type ExNode<S, P extends object> =
    & PrimaryNode<S, P>
    & { (data: any): void | Promise<void> }
    & { [portName in keyof P]: LocalPort<P[portName]> }
    ;

// prettier-ignore
export type ExSubnet<S, P extends object> =
    & Subnet<S, P>
    & { (data: any): void | Promise<void> }
    & { [portName in keyof P]: LocalPort<P[portName]> }
    ;

export namespace Node {
    // prettier-ignore
    export type ParentType =
        | undefined
        | null
        | Subnet<any, any>
        | RemoteNode
        ;

    export interface DefaultPorts<I = any, O = any> {
        $I: I;
        $O: O;
        $E: NodeError;
        [portName: string]: any;
    }

    export type CorePortsState<P extends object> = {
        [portName in keyof P]?: {
            direction: Port.Direction;
            /** If core is not a subnet core, it is always 0. */
            innerLinkNum: number;
        };
    };

    export type PortsState<P extends object> = {
        [portName in keyof P]?: {
            direction: Port.Direction;
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
        data: any;
        controlInfo: ControlInfo;
    }

    export interface ControlInfo {
        port?: Port;
        runStack?: any;
    }

    export type NodeRunConsole<N extends LocalNode<any, any>> = {
        readonly node: N['surfaceNode'];
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
            data: getPortsOfLocalNode<N>[portName],
        ) => void;
    };

    export interface Attr {
        name: string;
        events?: Dictionary<Function>;
    }

    export type PrimaryNodeEvents<N extends PrimaryNode<any, any>> = {
        nodeWillPipe: () => void;
        nodeDidPipe: () => void;
        nodeDidUnpipe: () => void;
        // nodeWillInnerPipe: () => void; // only available for subnet
        // nodeDidInnerPipe: () => void; // only available for subnet
        // nodeDidInnerUnpipe: () => void; // only available for subnet
        nodeWillRun: Event.NodeWillRunHandler<N>;
        // nodeRun: never; // event "NodeRun" should has and only has 1 handler
        nodeDidRun: Event.NodeDidRunHandler<N>;
        nodeWillOutput: () => void;
        corePortsStateChange: Event.CorePortsStateChangeHandler;
        nodePortsStateChange: Event.NodePortsStateChangeHandler<N>;
        nodeDidBecomeChild: () => void;
        nodeDidGetChild: () => void;
        nodeStateChange: () => void;
        nodeThrowError: Event.NodeThrowErrorHandler<N>;
    };

    export type SubnetDefine<S, P extends object> = (
        this: SubnetCore<S, P>,
    ) => void;

    export type SubnetEvents<N extends Subnet<any, any>> = {
        nodeWillPipe: () => void;
        nodeDidPipe: () => void;
        nodeDidUnpipe: () => void;
        // nodeWillInnerPipe: () => void; // only available for subnet
        // nodeDidInnerPipe: () => void; // only available for subnet
        // nodeDidInnerUnpipe: () => void; // only available for subnet
        nodeWillRun: Event.NodeWillRunHandler<N>;
        // nodeRun: never; // event "NodeRun" should has and only has 1 handler
        nodeDidRun: Event.NodeDidRunHandler<N>;
        nodeWillOutput: () => void;
        corePortsStateChange: Event.CorePortsStateChangeHandler;
        nodePortsStateChange: Event.NodePortsStateChangeHandler<N>;
        nodeDidBecomeChild: () => void;
        nodeDidGetChild: () => void;
        nodeStateChange: () => void;
        nodeThrowError: Event.NodeThrowErrorHandler<N>;
    };

    export namespace Event {
        export interface EventHandler extends Function {
            fromAttr?: Attr;
            priority: number;
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

        export type PrimaryNodeRun<N extends PrimaryNode<any, any>> = (
            this: NodeRunConsole<N>,
            data: any,
        ) => void | Promise<void>;

        export type SubnetRun<N extends Subnet<any, any>> = (
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
                this: N['surfaceNode'],
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
                this: N['surfaceNode'],
                arg: NodeDidRunArgument,
            ): void | Promise<void>;
        }

        export interface NodeThrowErrorHandler<N extends LocalNode<any, any>>
            extends EventHandler {
            (this: N['surfaceNode'], fromChild: boolean, nodeError: NodeError):
                | void
                | boolean;
        }

        export const enum CorePortsStateChangeAction {
            Create,
            DetermineDirection,
            ChangeInnerLinkNum,
        }
        export interface CorePortsStateChangeHandler extends EventHandler {
            (
                this: NodeCore<any, any> | SubnetCore<any, any>,
                portName: string,
                action: CorePortsStateChangeAction,
            ): void;
        }

        export const enum NodePortsStateChangeAction {
            Create,
            DetermineDirection,
            ChangeOuterLinkNum,
            ChangeInnerLinkNum,
        }
        export interface NodePortsStateChangeHandler<
            N extends LocalNode<any, any>
        > extends EventHandler {
            (
                this: N['surfaceNode'],
                portName: string,
                action: NodePortsStateChangeAction,
            ): void;
        }
    }
}

// prettier-ignore
export type PortLikeType =
    | ElementType.LocalPort
    | ElementType.RemotePort
    | ElementType.VirtualPort
    ;

// prettier-ignore
export type PortType =
    | ElementType.LocalPort
    | ElementType.RemotePort
    ;

export interface PortLike {
    readonly type: PortLikeType;
}

export interface Port extends PortLike {
    readonly type: PortType;
    readonly name: string;
}

import type { LocalPort } from './local-port';
import type { RemotePort } from './remote-port';
import type { VirtualPort } from './virtual-port';
export type { LocalPort, RemotePort, VirtualPort };

import type { LocalPortSet, ExLocalPortSet } from './local-port-set';
export type { LocalPortSet, ExLocalPortSet };

export namespace Port {
    export const enum Direction {
        // Determine the values to 0, 1 and 2 for
        // bit operation and array accessing.
        Out = 0,
        In = 1,
        Unknown = 2,
    }

    export const enum Side {
        // Determine the values to 0 and 1 for bit operation.
        Outer = 0,
        Inner = 1,
    }
}
