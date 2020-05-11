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

  pop(): T {
    if (this.length === 0) throw new Error("Empty Stack");
    this.length--;
    return this.buffer.pop();
  }

  top(): T {
    const topElem = this.buffer[this.buffer.length - 1];
    return topElem;
  }

  bottom(): T {
    return this.buffer[0];
  }
}
