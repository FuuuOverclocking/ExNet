import { Domain } from '../types';

const domainEventNameToTypeMap = {
    uncaughtNodeError: Domain.Event.LocalDomainEventType.UncaughtNodeError,
};

export function domainEventNameToType(name: string): number | undefined {
    return (domainEventNameToTypeMap as any)[name];
}

const nodeEventNameToTypeMap = {};

export function nodeEventNameToType(name: string): number | undefined {
    return (nodeEventNameToTypeMap as any)[name];
}
