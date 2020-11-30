/**
 * An implementation of sorted priority queue.
 * Elements are sorted when inserted, in descending order of priority firstly,
 * then in FIFO.
 */
export class PriorityQueue<E extends { priority: number }> extends Array<E> {
    public enqueue(element: E): this {
        let i = this.length;
        if (i === 0) {
            this.push(element);
            return this;
        }
        while (i--) {
            if (this[i].priority < element.priority) {
                if (i === 0) {
                    this.unshift(element);
                    return this;
                }
                continue;
            } else {
                this.splice(i + 1, 0, element);
                return this;
            }
        }

        // Unreachable code, just for avoid TypeScript error.
        return this;
    }

    public dequeue(): E | undefined {
        return this.shift();
    }
}
