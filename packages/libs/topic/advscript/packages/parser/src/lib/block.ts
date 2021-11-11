/* eslint-disable @typescript-eslint/no-misused-new */
import {
  createLiteralExpression,
  DocumentLine,
  ExpressionNodeData,
  NodeTypeKind,
  VariableIdentifier,
} from "./interface";
import { Scope } from "./scope";

interface BlockGenerator<T = unknown, TReturn = any, TNext = unknown>
  extends Iterator<T, TReturn, TNext> {
  // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
  next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
  return?: (value: TReturn) => IteratorResult<T, TReturn>;
  throw?: (e: any) => IteratorResult<T, TReturn>;
  [Symbol.iterator](): BlockGenerator<T, TReturn, TNext>;
}
export abstract class LogicBlock {
  currentLine: number;
  done: boolean;
  constructor(public variable: Scope, public data: DocumentLine[], public blockIndex = 0) {
    this.reset(data);
    this.variable.pushScope();
  }

  reset(data: DocumentLine[]) {
    this.data = data;
    this.currentLine = 0;
    this.done = false;
  }
  abstract getData(): BlockData;
  abstract createGenerate(): BlockGenerator<DocumentLine>;
}

export type LetLogic = {
  type: NodeTypeKind.Logic;
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
interface BlockData {
  type: string;
  currentLine: number;
  blockIndex?: number;
}
class ProcessBlock extends LogicBlock {
  constructor(public variable: Scope, public data: DocumentLine[], blockIndex?: number) {
    super(variable, data, blockIndex);
  }
  getData(): BlockData {
    return {
      type: "if",
      currentLine: this.currentLine,
      blockIndex: this.blockIndex,
    };
  }
  createGenerate() {
    return this;
  }
  [Symbol.iterator]() {
    return this;
  }
  next(): IteratorResult<DocumentLine, void> {
    if (this.currentLine < this.data.length) {
      const line = this.data[this.currentLine++];
      return { value: line as DocumentLine, done: false };
    } else {
      // !this.done && this.variable.popScope();
      // this.done = true;
      return { done: true, value: void 0 };
    }
  }
}

class WhileBlock extends LogicBlock {
  constructor(
    public variable: Scope,
    public data: DocumentLine[],
    public condition: ExpressionNodeData
  ) {
    super(variable, data);
  }
  getData() {
    return {
      type: "while",
      currentLine: this.currentLine,
    };
  }
  createGenerate() {
    return this;
  }
  [Symbol.iterator]() {
    return this;
  }
  next(): IteratorResult<any> {
    if (this.currentLine < this.data.length) {
      const line = this.data[this.currentLine++];
      return { value: line, done: false };
    } else {
      if (this.variable.calculate(this.condition)) {
        this.currentLine = 0;
        this.variable.switchScope();
        return this.next();
      } else {
        // !this.done && this.variable.popScope();
        // this.done = true;
        return { done: true, value: void 0 };
      }
    }
  }
}

class ForeachBlock extends LogicBlock {
  index: number;
  iteratorValues: any[];
  constructor(
    public variable: Scope,
    public data: DocumentLine[],
    public i: VariableIdentifier,
    public iterator: ExpressionNodeData
  ) {
    super(variable, data);
    this.iteratorValues = this.variable.calculate(iterator);
    this.index = 0;
    this.variable.pushScope();
    this.variable.assign(
      this.i.text,
      this.i.prefix,
      createLiteralExpression(this.iteratorValues[this.index]),
      true
    );
  }
  getData() {
    return {
      type: "foreach",
      currentLine: this.currentLine,
    };
  }

  createGenerate() {
    return this;
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
          this.i.text,
          this.i.prefix,
          createLiteralExpression(this.iteratorValues[this.index]),
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
