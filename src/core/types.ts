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

export type { NodeCore } from './node-core';
export type { SubnetCore } from './subnet-core';

// prettier-ignore
export type NodeLikeType =
    | ElementType.LocalNode
    | ElementType.LocalSubnet
    | ElementType.RemoteNode
    | ElementType.VirtualNode
    | ElementType.UnknownNode
    ;

export interface NodeLike {
    readonly type: NodeLikeType;
}

export interface Node {
    readonly domain: Domain;
    readonly isSubnet: boolean;
}

export interface Subnet extends Node {
    readonly isSubnet: true;
}

import type { LocalNode } from './local-node';
import type { LocalSubnet } from './local-subnet';
import type { RemoteNode } from './remote-node';
import type { VirtualNode } from './virtual-node';
import type { UnknownNode } from './unknown-node';
export type { LocalNode, LocalSubnet, RemoteNode, VirtualNode, UnknownNode };

export namespace Node {
    export interface DefaultPorts<I = any, O = any> {
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

    export const enum NodeRunningStage {
        NodeWillRun,
        NodeIsRunning,
        NodeDidRun,
        NodeEnded,
    }

    export interface NodeError {
        node: Node;
        error: Error;
        stage: NodeRunningStage;
        dataSnapshot: any;
        controlInfo: NodeControlInfo;
    }

    export interface NodeControlInfo {
        port?: Port;
    }

    export type NodeRunConsole<N extends LocalNode> = {
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

    export const enum NodeEventType {
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
        NodeGoOnline,
        NodeGoOffline,
        RemoteError,
        NodeRunNotice,
        NodeDidRunNotice,
    }

    // prettier-ignore
    export const enum NodeEventPriority {
        SystemLow = 0,       //  0- 4
        Low = 5,             //  5- 9
        BelowNormal = 10,    // 10-14
        Normal = 15,         // 15
        AboveNormal = 16,    // 16-20
        High = 21,           // 21-25
        SystemHigh = 26,     // 26-31
    }

    export namespace NodeEvent {
        export interface NodeEventHandler extends Function {
            fromAttr?: Attr;
            priority?: number;
        }

        export type NodeRun<N extends LocalNode> = (
            this: NodeRunConsole<N>,
            data: any,
        ) => void | Promise<void>;

        export type SubnetRun<N extends LocalNode> = (
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
