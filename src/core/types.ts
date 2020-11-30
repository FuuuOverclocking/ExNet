import type {
    Dictionary,
    getPortsOfLocalNode,
    getStateOfLocalNode,
    extractTypeFromPortTypeDescriptor,
} from './utility-types';
export type { Dictionary };

export interface Domain {
    /** Domain ID uniquely identifies a domain among interconnected domains. */
    readonly id: string;
    /** Every time the program re-runs, `runID` is randomly generated. */
    readonly runID: string;
    readonly isLocal: boolean;
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

export namespace Node {
    export interface DefaultPorts<I, O> {
        $I: I;
        $O: O;
        $E: NodeError;
        [portName: string]: any;
    }

    export type NodePortsState<P extends object> = {
        [portName in keyof P]?: {
            direction: Port.PortIORole;
            outerLinkNum: number;
            /** If node is not a subnet, it is always 0. */
            innerLinkNum: number;
        };
    };

    export const enum NodeWorkingStage {
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
        stage: NodeWorkingStage;
        // dataSnapshot: any;
        controlInfo: NodeControlInfo;
    }

    export interface NodeControlInfo {
        port?: Port;
    }

    export type NodeRunConsole<N extends LocalNode<any, any>> = {
        node: N;
        state: getStateOfLocalNode<N>;
        entry: {
            [portName in keyof getPortsOfLocalNode<N>]: boolean;
        } & {
            is(portName: string): boolean;
        };
    } & {
        [portName in keyof getPortsOfLocalNode<N>]: (
            data: extractTypeFromPortTypeDescriptor<
                getPortsOfLocalNode<N>[portName]
            >,
        ) => void;
    };

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

        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        NumberOfEventTypes = NodeThrowError + 1,
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

        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        NumberOfEventTypes = RemoteError + 1,
    }

    // prettier-ignore
    export const enum NodeEventPriority {
        SystemLow   =  0, //  0- 4
        Low         =  5, //  5- 9
        BelowNormal = 10, // 10-14
        Normal      = 15, // 15
        AboveNormal = 16, // 16-20
        High        = 21, // 21-25
        SystemHigh  = 26, // 26-31
    }

    export interface NodeEventHandler extends Function {
        fromAttr?: Attr;
        priority: number;
    }

    export namespace NodeEvent {
        export type NodeRun<N extends LocalNode<any, any>> = (
            this: NodeRunConsole<N>,
            data: any,
        ) => void | Promise<void>;

        export type SubnetRun<N extends LocalNode<any, any>> = (
            this: NodeRunConsole<N>,
            data: any,
            runNet: () => void,
        ) => void | Promise<void>;
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

export interface ExPort<T = any, D = Port.PortIORole> {
    __ExPortBrand__: any;
}
