import { parseExpression } from "../expression";
import {
  defineActions,
  ExpressionNodeData,
  ForeachStatmentData,
  IfStatmentData,
  LabelNode,
  LetStatmentData,
  LetStatmentExprData,
  Node,
  NodeTypeKind,
  StatementData,
  ValueNodeData,
  WhileStatmentData,
} from "../interface";
import { VariableNode } from "../expression/Exp";
import { AssignExprNode, ExpressionNode } from "../expression";
import { toSourceString } from "./_util";
export interface IfStatement extends Node<IfStatmentData> {}
export interface WhileStatement extends Node<WhileStatmentData> {}
export interface ForeachStatment extends Node<ForeachStatmentData> {}

export interface LetStatment extends Node<LetStatmentData> {}

export const LogicBlock = defineActions<any>({
  Scripts(n) {
    return n.children.map((node) => node.parse() as StatementData);
  },
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

  logic_statment_let(space, head, expression, end) {
    const vars = expression.parse() as ExpressionNodeData[];
    const explicit = head.parse().length > 1;
    return {
      type: "logic",
      name: "let",
      explicit,
      statements: vars.map((node) => {
        switch (node.type) {
          case NodeTypeKind.Identifier:
            return {
              type: "logic",
              explicit,
              left: node,
              right: { type: NodeTypeKind.Raw, value: null } as ValueNodeData,
            };
          case NodeTypeKind.Expression: {
            const { value, ...other } = node;
            return {
              type: "logic",
              ...other,
              explicit,
              left: value.left,
              right: value.right,
            };
          }
        }
      }),
    };
  },
  expr_logic(expression) {
    return parseExpression(`(${expression.parse()})`);
  },
  expr_template(text) {
    return parseExpression(`{{${text.sourceString}}}`)?.[0];
  },
  expr_quick(text) {
    try {
      return parseExpression(`<${text.sourceString}>`)?.[0];
    } catch (error) {
      return text.sourceString
    }
  },
  command(expression) {
    return parseExpression(`<${expression.parse()}>`)?.[0];
  },
  callCommand(_, command, __) {
    return {
      ...parseExpression(`<${command.parse()}>`)?.[0],
      source: `[${command.sourceString}]`
    }
  },
  anwsome_a(start, content, end) {
    return toSourceString(start, content, end)
  },
  anwsome_b(start, content, end) {
    return toSourceString(start, content, end)
  },
  expression(expression) {
    return parseExpression(`(${expression.parse()})`);
  },
  LET(head: LabelNode, varStatment: LetAssignStatmentArrayNode): LetStatmentData {
    const explicit = head.parse().length > 1;
    return {
      type: "logic",
      name: "let",
      explicit: explicit,
      statements: explicit && varStatment.parse(),
    };
  },
  LetAssignExpr_assign(variable: AssignExprNode) {
    const { value, ...other } = variable.parse();
    return {
      type: "logic",
      ...other,
      explicit: true,
      left: value.left,
      right: value.right,
    };
  },
  LetAssignExpr_nonAssign(variable: VariableNode) {
    return {
      type: "logic",
      name: "AssignExpression",
      explicit: true,
      left: variable.parse(),
      right: { type: NodeTypeKind.Raw, value: null } as ValueNodeData,
    };
  },
});
export type LetAssignStatmentArrayNode = Node<LetStatmentExprData[]>;
