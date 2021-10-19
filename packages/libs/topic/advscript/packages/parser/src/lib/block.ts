/* eslint-disable @typescript-eslint/no-misused-new */
import { LogicStatmentData, NodeTypeKind, StatementData } from "./interface";
import { IdentifierData } from "./interface";
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
interface ProcessBlockData {
  type: string;
  currentLine: number;
  blockIndex: number;
}
class ProcessBlock {
  data: LogicStatmentData[];
  blockIndex: number;
  currentLine: number;
  done: boolean;
  constructor(public variable: Scope, data: LogicStatmentData[], blockIndex?: number) {
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
  getData(): ProcessBlockData {
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
        this.variable.switchScope();
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
  iteratorValues: any[];
  constructor(
    public variable: Scope,
    public data: StatementData[],
    public i: IdentifierData,
    public iterator: ExpressionNodeData
  ) {
    this.reset();
    this.data = data;
    this.i = i;
    this.iteratorValues = this.variable.calc(iterator);
    this.index = 0;
    this.variable.pushScope();
    this.variable.assign(
      this.i.value,
      this.i.prefix,
      { type: NodeTypeKind.Raw, value: this.iteratorValues[this.index] },
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
    if (!this.iteratorValues.length) return { done: true };
    if (this.currentLine < this.data.length) {
      const line = this.data[this.currentLine++];
      return { value: line, done: false };
    } else {
      if (this.index < this.iteratorValues.length - 1) {
        this.currentLine = 0;
        this.index++;
        this.variable.switchScope();
        this.variable.assign(
          this.i.value,
          this.i.prefix,
          { type: NodeTypeKind.Raw, value: this.iteratorValues[this.index] },
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

export { ProcessBlock, WhileBlock, ForeachBlock };
