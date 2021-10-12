// import Grammar from "./adv.ohm";
import { Actions, StatementData } from "./actions";
import {
  ForeachStatmentData,
  IfStatmentData,
  LetStatmentData,
  WhileStatmentData,
} from "./actions/LogicBlock";
import { Block, ForeachBlock, IfBlock, WhileBlock } from "./block";
import { IContent } from "./actions/story";
import { Scope, createScope } from "./variable";
import grammar from "@adv.ohm-bundle";
// const mySemantics = Grammar.createSemantics();
// mySemantics.addOperation("parse", Actions);
const mySemantics2 = grammar.createSemantics();
mySemantics2.addOperation("parse", Actions);

export function parse(source: string) {
  const result2 = grammar.match(source);
  if (result2.succeeded()) {
    console.log("result2");
    return mySemantics2(result2).parse();
  } else {
    throw Error(result2.message);
  }
  // const result = Grammar.match(source);
  // if (result.succeeded()) {
  //   return mySemantics(result).parse();
  // } else {
  //   throw Error(result.message);
  // }
}

export class AdvScriptLoader {
  BLOCKSTACK: Block[] = [];
  CURRENTBLOCK: Block;

  private scope: Scope;

  constructor(
    public statements: any[],
    private onGlobalChanged?: any,
    variable: Scope = createScope()
  ) {
    this.scope = variable;
    this.CURRENTBLOCK = new IfBlock(this.scope, statements);
    this.BLOCKSTACK = [];
    console.log(statements);
  }

  protected [Symbol.iterator]() {
    return this;
  }

  protected next(): IteratorResult<IContent> {
    const { value, done } = this.CURRENTBLOCK.next();
    if (done) {
      const CURRENTBLOCK = this.BLOCKSTACK.pop();
      if (CURRENTBLOCK) {
        this.CURRENTBLOCK = CURRENTBLOCK;
        this.scope.popScope();
        return this.next();
      } else {
        return { done: true, value: void 0 };
      }
    } else {
      const retValue = this.handleScript(value);
      if (retValue) {
        return { value: retValue, done: false };
      } else {
        // handleLogic will return undefined, so should exec next line
        return this.next();
      }
    }
  }

  private handleScript(argLine: any) {
    // deep copy
    const line = Object.assign({}, argLine);
    if (line.type === "content") {
      return this.handleContent(line);
    } else if (line.type === "") {
      return line;
    } else if (line.type === "logic") {
      return this.handleLogic(line);
    } else if (line.type === "comment") {
      return null;
    } else {
      return line;
    }
  }

  handleContent({ params: { ...params }, ...line }: IContent) {
    const keys = Object.keys(params);
    for (const key of keys) {
      params[key] = this.scope.calc(params[key]);
      if (params[key] instanceof Array && key === "raw") {
        params[key] = params[key].join("");
      }
    }
    return { ...line, params };
  }

  private handleLogic(line: StatementData) {
    // console.log("handleLogic", line);
    switch (line.name) {
      case "if":
        return this.handleLogicIf(line);
      case "while":
        return this.handleLogicWhile(line);
      case "foreach":
        return this.handleLogicForeach(line);
      case "let":
        return this.handleLogicLet(line);
      default:
        throw Error(`Unrecognized name ${(line as any).name}`);
    }
  }

  private handleLogicIf(line: IfStatmentData) {
    let blockIndex = 0;
    for (const condition of line.conditions) {
      if (this.scope.calc(condition)) {
        break;
      } else {
        blockIndex++;
      }
    }
    this.BLOCKSTACK.push(this.CURRENTBLOCK);
    const blockData = line.blocks[blockIndex];
    const block = new IfBlock(this.scope, blockData, blockIndex);
    this.CURRENTBLOCK = block;
    // this.variable.pushScope();
  }

  private handleLogicWhile(line: WhileStatmentData) {
    const result = this.scope.calc(line.condition);
    if (result) {
      this.BLOCKSTACK.push(this.CURRENTBLOCK);
      const blockData = line.block;
      const block = new WhileBlock(this.scope, blockData, line.condition);
      this.CURRENTBLOCK = block;
    }
    // this.variable.pushScope();
  }

  private handleLogicForeach(line: ForeachStatmentData) {
    // console.log(line.children);
    const children = this.scope.calc(line.children);
    if (children instanceof Array) {
      this.BLOCKSTACK.push(this.CURRENTBLOCK);
      const blockData = line.block;
      const block = new ForeachBlock(this.scope, blockData, line.child, line.children);
      this.CURRENTBLOCK = block;
    } else if (line.children.type === "ArraySpread") {
      throw Error("[Foreach] 语法错误");
    } else {
      throw Error(`[Foreach] \`${line.children?.value}\` must be a array`);
    }
    // this.variable.pushScope();
  }

  private handleLogicLet(lines: LetStatmentData) {
    lines.statements?.forEach((line) => {
      if (line.left.prefix === "$") {
        this.onGlobalChanged?.();
      }
      this.scope.assign(line.left.value, line.left.prefix, line.right, line.explicit);
    });
  }
}
