import { StatementData } from ".";
import { Node, defineActions, LabelNode, OperatorNode } from "../interface";
import { VariableNode, VariableNodeData } from "./arithmetic";
import { ValueNode, ValueNodeData } from "./base";
import { ExpressionNode, ExpressionNodeData } from "./Expression";

export interface LogicStatmentData {
  type: "logic";
  name: string;
}
export interface IfStatmentData extends LogicStatmentData {
  name: "if";
  conditions: ExpressionNodeData[];
  blocks: StatementData[];
}
export interface IfStatement extends Node<IfStatmentData> {}
export interface WhileStatmentData extends LogicStatmentData {
  name: "while";
  condition: ExpressionNodeData[];
  block: StatementData[];
}
export interface WhileStatement extends Node<WhileStatmentData> {}
export interface ForeachStatmentData extends LogicStatmentData {
  name: "foreach";
  child: VariableNodeData;
  children: ExpressionNodeData;
  block: StatementData[];
}
export interface ForeachStatment extends Node<ForeachStatmentData> {}

export const LogicBlock = defineActions({
  LogicBlock_IF(IF, LogicBlock1, ELSEIFs, LogicBlock2s, ELSE, LogicBlock3, END): IfStatmentData {
    // get conditions
    const conditions = [IF.parse()];
    for (const ELSEIF of ELSEIFs.children) {
      conditions.push(ELSEIF.parse());
    }

    // get stroy block
    const blocks = [];
    const block1 = [];
    for (const LogicBlock of LogicBlock1.children) {
      block1.push(LogicBlock.parse());
    }
    blocks.push(block1);
    for (const LogicBlock2 of LogicBlock2s.children) {
      const block2 = [];
      for (const LogicBlock of LogicBlock2.children) {
        block2.push(LogicBlock.parse());
      }
      blocks.push(block2);
    }
    const block3 = [];
    if (LogicBlock3.child(0)) {
      for (const LogicBlock of LogicBlock3.child(0).children) {
        block3.push(LogicBlock.parse());
      }
    }
    blocks.push(block3);

    return {
      type: "logic",
      name: "if",
      conditions: conditions,
      blocks: blocks,
    } as const;
  },
  LogicBlock_WHILE(WHILE: Node<ExpressionNodeData[]>, LogicBlocks, END): WhileStatmentData {
    const condition = WHILE.parse();
    const block = [];
    for (const LogicBlock of LogicBlocks.children) {
      block.push(LogicBlock.parse());
    }
    return {
      type: "logic",
      name: "while",
      condition: condition,
      block: block,
    };
  },
  LogicBlock_FOREACH(FOREACH, LogicBlocks, _END): ForeachStatmentData {
    const condition = FOREACH.parse();
    const block = [];
    for (const LogicBlock of LogicBlocks.children) {
      block.push(LogicBlock.parse());
    }
    return {
      type: "logic",
      name: "foreach",
      child: condition.child,
      children: condition.children,
      block: block,
    };
  },
  IF(_head, Expression: ExpressionNode) {
    // condtion Object
    return Expression.parse();
  },
  ELSEIF(_head, Expression: ExpressionNode) {
    // condtion Object
    return Expression.parse();
  },
  WHILE(_head, Expression: ExpressionNode) {
    // condtion Object
    return Expression.parse();
  },
  FOREACH(_head, childVar, _in, childrenVar) {
    // console.log(childrenVar.parse())
    return {
      child: childVar.parse(),
      children: childrenVar.parse(),
    };
  },
  LET(head: LabelNode, varStatment: LetStatmentExprArray, end): LetStatmentData {
    const explicit = head.parse().length > 1;
    return {
      type: "logic",
      name: "let",
      explicit: explicit,
      statements: explicit && varStatment.parse(),
    };
  },
  LetStatement(append: LetStatmentExprArray) {
    return append.parse();
  },
  LetStatement_assign(
    variable: VariableNode,
    operator: OperatorNode,
    Exp: ValueNode
  ): LetStatmentExprData {
    return {
      type: "logic",
      name: "VariableDeclaration",
      explicit: true,
      left: variable.parse(),
      right: Exp.parse(),
    };
  },
  LetStatement_nonAssign(variable: VariableNode): LetStatmentExprData {
    return {
      type: "logic",
      name: "VariableDeclaration",
      explicit: true,
      left: variable.parse(),
      right: { type: "value", value: null } as ValueNodeData,
    };
  },
});

export interface LetStatmentData extends LogicStatmentData {
  name: "let";
  explicit: boolean;
  statements: LetStatmentExprData[];
}
export interface LetStatment extends Node<LetStatmentData> {}
export interface LetStatmentExprData extends LogicStatmentData {
  name: "VariableDeclaration";
  explicit: boolean;
  left: VariableNodeData;
  right: ExpressionNodeData;
}

export interface LetStatmentExpr extends Node<LetStatmentExprData> {}
export interface LetStatmentExprArray extends Node<LetStatmentExprData[]> {}
