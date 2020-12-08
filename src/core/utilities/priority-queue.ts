/**
 * An implementation of sorted priority queue.
 * Elements are sorted when inserted, in descending order of priority firstly,
 * then in FIFO.
 */
export class PriorityQueue<E extends { priority: number }> extends Array<E> {
    public enqueue(element: E): void {
        let i = this.length;
        if (i === 0) {
            this.push(element);
            return;
        }
        while (i--) {
            if (this[i].priority < element.priority) {
                if (i === 0) {
                    this.unshift(element);
                    return;
                }
                continue;
            } else {
                this.splice(i + 1, 0, element);
                return;
            }
        }

        // Unreachable code, just for avoid TypeScript error.
        return;
    }

    public remove(index: number): void {
        this.splice(index, 1);
    }
}
