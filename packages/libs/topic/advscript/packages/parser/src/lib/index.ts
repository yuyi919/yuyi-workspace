import { LogicBlock, ForeachBlock, ProcessBlock, WhileBlock } from "./block";
import {
  ContentKind,
  ContentLine,
  DocumentLine,
  EmptyContentLine,
  ExpressionNodeData,
  ForeachStatmentData,
  IfStatmentData,
  LetStatmentData,
  LogickStatmentKind,
  LogicStatment,
  MacroContentLine,
  NodeTypeKind,
  StatmentArray,
  WhileStatmentData,
} from "./interface";
import { createScope, Scope } from "./scope";

export class ScriptVM {
  BLOCKSTACK: LogicBlock[] = [];
  BLOCKSET = new Set<LogicBlock>();
  CURRENTBLOCK: LogicBlock;

  constructor(private onGlobalChanged?: any, public scope?: Scope) {}

  exec(statements: DocumentLine[], scope: Scope = createScope()) {
    if (scope !== this.scope) {
      this.scope = scope;
    }
    this.CURRENTBLOCK = new ProcessBlock(this.scope, statements);
    this.BLOCKSTACK = [];
    console.log(statements, scope);
    return this;
  }

  public createGenerator() {
    if (!this.CURRENTBLOCK) {
      throw Error("call exec");
    }
    return this.createGeneratorWith(this.CURRENTBLOCK);
  }

  public *createGeneratorWith(block: LogicBlock): Generator<ContentLine> {
    for (const data of block.createGenerate()) {
      const retValue = this.handleScript(data);
      // console.log("[iterator]", data, retValue);
      if (retValue) {
        yield retValue;
      } else {
        // handleLogic will return undefined, so should exec next line
        yield* this.createGeneratorWith(this.CURRENTBLOCK);
      }
    }
    const CURRENTBLOCK = this.BLOCKSTACK.pop();
    if (CURRENTBLOCK) {
      this.CURRENTBLOCK = CURRENTBLOCK;
      this.scope.popScope();
      return this.createGeneratorWith(this.CURRENTBLOCK);
    }
  }

  // protected next(): IteratorResult<DocumentLine> {
  //   const { value, done } = this.CURRENTBLOCK.next();
  //   if (done) {
  //     const CURRENTBLOCK = this.BLOCKSTACK.pop();
  //     if (CURRENTBLOCK) {
  //       this.CURRENTBLOCK = CURRENTBLOCK;
  //       this.scope.popScope();
  //       return this.next();
  //     } else {
  //       return { done: true, value: void 0 };
  //     }
  //   } else {
  //     const retValue = this.handleScript(value);
  //     if (retValue) {
  //       return { value: retValue, done: false };
  //     } else {
  //       // handleLogic will return undefined, so should exec next line
  //       return this.next();
  //     }
  //   }
  // }

  private handleScript(argLine: DocumentLine): ContentLine | void {
    if (!argLine) return;
    // deep copy
    const line = { ...argLine } as DocumentLine;
    if (line.type === NodeTypeKind.Content) {
      if (line.kind === ContentKind.Array) {
        return this.handleChildren(line as StatmentArray);
      }
      if (line.kind === ContentKind.Empty) {
        return this.handleEmpty(line);
      }
      return this.handleContent(line);
    }
    if (line.type === NodeTypeKind.Logic) {
      return this.handleLogic(line);
    } else if (line.type === NodeTypeKind.Comment) {
      return null;
    }
    // else if (line.type === NodeTypeKind.Expression) {
    //   return this.scope.calculate(line);
    // }
    else {
      return line;
    }
  }

  handleEmpty(line: EmptyContentLine) {
    return {
      ...line,
      argumentList: ["end"],
    };
  }

  handleContent({ argumentList: args = [], ...line }: MacroContentLine) {
    return {
      ...line,
      argumentList: args.map((params) => {
        if (params instanceof Object) {
          if (params.type) {
            return this.scope.calculate(params as ExpressionNodeData);
          }
          params = { ...params };
          const keys = Object.keys(params);
          for (const key of keys) {
            params[key] = this.scope.calculate(params[key]);
          }
        }
        return params;
      }),
    };
  }

  private handleLogic(line: LogicStatment) {
    // console.log("handleLogic", line);
    switch (line.kind) {
      case LogickStatmentKind.IF:
        return this.handleLogicIf(line);
      case LogickStatmentKind.WHILE:
        return this.handleLogicWhile(line);
      case LogickStatmentKind.FOREACH:
        return this.handleLogicForeach(line);
      case LogickStatmentKind.LET:
        return this.handleLogicLet(line);
      default:
        throw Error(`Unrecognized kind: ${(line as any).kind}`);
    }
  }

  private pushBlock() {
    this.BLOCKSTACK.push(this.CURRENTBLOCK);
  }
  private setCurrentBlock(block: LogicBlock) {
    this.CURRENTBLOCK = block;
    this.BLOCKSET.add(block);
  }

  private handleChildren(line: StatmentArray, blockIndex = 0) {
    this.pushBlock();
    const blockData = line.value;
    const block = new ProcessBlock(this.scope, blockData, blockIndex);
    this.setCurrentBlock(block);
    // this.variable.pushScope();
  }

  private handleLogicIf(line: IfStatmentData) {
    let blockIndex = 0;
    for (const condition of line.conditions) {
      if (this.scope.calculate(condition)) {
        break;
      } else {
        blockIndex++;
      }
    }
    line.blocks[blockIndex] && this.handleChildren(line.blocks[blockIndex], blockIndex);
    // this.variable.pushScope();
  }

  private handleLogicWhile(line: WhileStatmentData) {
    const result = this.scope.calculate(line.condition);
    if (result) {
      this.pushBlock();
      const blockData = line.block;
      const block = new WhileBlock(this.scope, blockData, line.condition);
      this.setCurrentBlock(block);
    }
    // this.variable.pushScope();
  }

  private handleLogicForeach(line: ForeachStatmentData) {
    // console.log(line.children);
    const children = this.scope.calculate(line.children);
    if (children instanceof Array) {
      this.pushBlock();
      const blockData = line.block;
      const block = new ForeachBlock(this.scope, blockData, line.child, line.children);
      this.setCurrentBlock(block);
    } else if (line.children.type === NodeTypeKind.Expression) {
      throw Error("[Foreach] 语法错误");
    } else if (line.children.type !== NodeTypeKind.Comment) {
      throw Error(`[Foreach] \`${line.children?.sourceString}\` must be a array`);
    }
    // this.variable.pushScope();
  }

  private handleLogicLet(lines: LetStatmentData) {
    lines.statements?.forEach((line) => {
      if (line.left.prefix === "$") {
        this.onGlobalChanged?.();
      }
      this.scope.assign(line.left.text, line.left.prefix, line.right, line.explicit);
    });
  }
}

// export { parse } from "./fountain";

export * from "./interface";

export * from "./parser";
export * from "./parser/index";
