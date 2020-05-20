export class Stack<T> {
  private buffer: T[];
  length: number;

  constructor() {
    this.buffer = [];
    this.length = 0;
  }

  push(elem: T) {
    this.buffer.push(elem);
    this.length++;
  }

  appendStack(stack: Stack<T>) {
    this.buffer.push(...stack.buffer);
  }

  pop(): T {
    if (this.length === 0) throw new Error("Empty Stack");
    this.length--;
    return this.buffer.pop();
  }

  top(): T {
    const topElem = this.buffer[this.buffer.length - 1];
    return topElem;
  }

  empty(): boolean {
    return this.length === 0;
  }

  reset() {
    this.buffer = [];
    this.length = 0;
  }
}
