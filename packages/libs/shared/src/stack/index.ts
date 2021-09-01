/* eslint-disable @typescript-eslint/ban-types */
import { Cons, cons, returnItem, returnStack } from "./cons.tsmacro";
export class Stack<T> {
  private _stack: Cons<T>;
  public length: number = 0;

  push?(obj: T) {
    this._stack = cons<T>(obj, this._stack);
    this.length++;
    return this;
  }

  pop?(): T | undefined {
    if (this._stack) {
      const top = this._stack(returnItem);
      this._stack = this._stack(returnStack);
      this.length--;
      return top;
    }
    return;
  }
}
