/* eslint-disable @typescript-eslint/no-misused-new */
import { StatementData } from "./interface";
import { VariableNodeData } from "./interface";
import { ExpressionNodeData } from "./interface";
import { Scope } from "./variable";

export abstract class Block {
  currentLine: number;
  done: boolean;
  constructor(public variable: Scope, public data: any[], public blockIndex?: number) {
    this.reset();
    this.variable.pushScope();
  }

  reset() {
    this.data = [];
    this.currentLine = 0;
    this.done = false;
  }
  getData(): {
    type: string;
    currentLine: number;
    blockIndex?: number;
  } {
    return {
      type: "if",
      currentLine: this.currentLine,
      blockIndex: this.blockIndex,
    };
  }
  [Symbol.iterator]() {
    return this;
  }
  next(): Partial<IteratorResult<any>> {
    if (this.currentLine < this.data.length) {
      const line = this.data[this.currentLine++];
      return { value: line, done: false };
    } else {
      // !this.done && this.variable.popScope();
      // this.done = true;
      return { done: true };
    }
  }
}
export type LetLogic = {
  type: "logic";
  name: "let";
  explicit: true;
  left: {
    type: "variable";
    prefix: null;
    value: "foo";
  };
  right: {
    type: "value";
    value: 123;
  };
};
interface IfBlockData {
  type: string;
  currentLine: number;
  blockIndex: number;
}
class IfBlock {
  data: any;
  blockIndex: number;
  currentLine: number;
  done: boolean;
  constructor(public variable: Scope, data, blockIndex?: number) {
    this.reset();
    this.data = data;
    this.blockIndex = blockIndex;
    this.variable.pushScope();
  }
  reset() {
    this.data = [];
    this.currentLine = 0;
    this.done = false;
  }
  getData(): IfBlockData {
    return {
      type: "if",
      currentLine: this.currentLine,
      blockIndex: this.blockIndex,
    };
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    if (this.currentLine < this.data.length) {
      const line = this.data[this.currentLine++];
      return { value: line, done: false };
    } else {
      // !this.done && this.variable.popScope();
      // this.done = true;
      return { done: true };
    }
  }
}

class WhileBlock {
  data: any;
  condition: any;
  currentLine: number;
  done: boolean;
  constructor(public variable: Scope, data, condition) {
    this.reset();
    this.data = data;
    this.condition = condition;
    this.variable.pushScope();
  }
  reset() {
    this.data = [];
    this.currentLine = 0;
    this.done = false;
  }
  getData() {
    return {
      type: "while",
      currentLine: this.currentLine,
    };
  }
  [Symbol.iterator]() {
    return this;
  }
  next(): Partial<IteratorResult<any>> {
    if (this.currentLine < this.data.length) {
      const line = this.data[this.currentLine++];
      return { value: line, done: false };
    } else {
      if (this.variable.calc(this.condition)) {
        this.currentLine = 0;
        this.variable.popScope();
        this.variable.pushScope();
        return this.next();
      } else {
        // !this.done && this.variable.popScope();
        // this.done = true;
        return { done: true };
      }
    }
  }
}

class ForeachBlock {
  index: number;
  currentLine: number;
  done: boolean;
  childrenValue: any[];
  constructor(
    public variable: Scope,
    public data: StatementData[],
    public child: VariableNodeData,
    public children: ExpressionNodeData
  ) {
    this.reset();
    this.data = data;
    this.child = child;
    this.childrenValue = this.variable.calc(children);
    this.index = 0;
    this.variable.pushScope();
    this.variable.assign(
      this.child.value,
      this.child.prefix,
      { type: "value", value: this.childrenValue[this.index] },
      true
    );
  }
  reset() {
    this.data = [];
    this.currentLine = 0;
    this.done = false;
  }
  getData() {
    return {
      type: "foreach",
      currentLine: this.currentLine,
    };
  }

  [Symbol.iterator]() {
    return this;
  }

  next() {
    if (!this.childrenValue.length) return { done: true };
    if (this.currentLine < this.data.length) {
      const line = this.data[this.currentLine++];
      return { value: line, done: false };
    } else {
      if (this.index < this.childrenValue.length - 1) {
        this.currentLine = 0;
        this.index++;
        this.variable.popScope();
        this.variable.pushScope();
        this.variable.assign(
          this.child.value,
          this.child.prefix,
          { type: "value", value: this.childrenValue[this.index] },
          true
        );
        return this.next();
      } else {
        // !this.done && this.variable.popScope();
        // this.done = true;
        return { done: true };
      }
    }
  }
}

export { IfBlock, WhileBlock, ForeachBlock };
