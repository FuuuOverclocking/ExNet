export class ArrayQueue<E> extends Array<E> {
    public enqueue(element: E): void {
        this.push(element);
    }
    public remove(index: number): void {
        this.splice(index, 1);
    }
}
