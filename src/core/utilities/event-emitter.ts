import type { AnyFunction, Dictionary } from 'core/utility-types';
import { ArrayQueue } from './array-queue';
import { PriorityQueue } from './priority-queue';

export namespace EventEmitter {
    export interface HandlerQueue<F extends AnyFunction> extends Array<F> {
        enqueue(handler: F): void;
        remove(index: number): void;
    }
    export const enum HandlerQueueType {
        ArrayQueue,
        PriorityQueue,
    }
}

export class EventEmitter<E extends Dictionary<AnyFunction>> {
    public readonly eventHandlers: {
        [event in keyof E]?: EventEmitter.HandlerQueue<E[event]>;
    } = {};
    constructor(
        private readonly queueType: EventEmitter.HandlerQueueType = EventEmitter
            .HandlerQueueType.ArrayQueue,
    ) {}

    private getHandlerQueue(): EventEmitter.HandlerQueue<any> {
        switch (this.queueType) {
            case EventEmitter.HandlerQueueType.ArrayQueue:
                return new ArrayQueue();
            case EventEmitter.HandlerQueueType.PriorityQueue:
                return new PriorityQueue();
        }
    }

    public on<K extends keyof E>(event: K, handler: E[K]): void {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = this.getHandlerQueue();
        }
        this.eventHandlers[event]!.enqueue(handler);
    }

    public off<K extends keyof E>(event: K, handler: E[K]): void {
        const queue = this.eventHandlers[event];
        if (!queue) return;

        const index = queue.indexOf(handler);
        if (index !== -1) queue.remove(index);
    }

    public emit<K extends keyof E>(
        event: K,
        thisArg: ThisParameterType<E[K]>,
        ...args: Parameters<E[K]>
    ): void {
        const queue = this.eventHandlers[event];
        if (!queue || !queue.length) return;

        const len = queue.length;
        for (let i = 0; i < len; ++i) {
            queue[i].apply(thisArg, args);
        }
    }
}
