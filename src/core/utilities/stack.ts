export class Stack<T> {
    public stack: T[] = [];

    public top(): T | undefined {
        const { stack } = this;
        return stack.length ? stack[stack.length - 1] : void 0;
    }

    public empty(): boolean {
        return !this.stack.length;
    }

    public pop(): T | undefined {
        return this.stack.pop();
    }

    public push(item: T): this {
        this.stack.push(item);
        return this;
    }
}
