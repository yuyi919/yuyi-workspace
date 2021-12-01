import { CommaExpressionNode, ExpressionNode, visitExpressionNode } from "../expression";
import {
  defineActions,
  ExpressionKind,
  createLiteralExpression,
  ForeachStatmentData,
  IfStatmentData,
  LetStatmentData,
  LetStatmentExprData,
  Node,
  NodeTypeKind,
  LogicStatment,
  LiteralExpression,
  WhileStatmentData,
  ExpressionNodeData,
  createLines,
  StatmentArray,
  createIfLogic,
  createForeachLogic,
  createVariableLogic,
} from "../interface";
import { toSource } from "./_util";
export interface IfStatement extends Node<IfStatmentData> {}
export interface WhileStatement extends Node<WhileStatmentData> {}
export interface ForeachStatment extends Node<ForeachStatmentData> {}

export interface LetStatment extends Node<LetStatmentData> {}

export const LogicBlock = defineActions<any>({
  // LogicBlock_IF(IF, ifBlock, ELSEIFs, elseifBlock, ELSE, elseBlock, END): IfStatmentData {
  //   // get conditions
  //   const conditions = [IF.parse()];
  //   for (const ELSEIF of ELSEIFs.children) {
  //     conditions.push(ELSEIF.parse());
  //   }

  //   // get stroy block
  //   const blocks = [];
  //   const block1 = [];
  //   for (const LogicBlock of ifBlock.children) {
  //     block1.push(LogicBlock.parse());
  //   }
  //   blocks.push(block1);

  //   for (const block of elseifBlock.children) {
  //     const block2 = [];
  //     for (const LogicBlock of block.children) {
  //       block2.push(LogicBlock.parse());
  //     }
  //     blocks.push(block2);
  //   }

  //   const block3 = [];
  //   if (elseBlock.child(0)) {
  //     for (const LogicBlock of elseBlock.child(0).children) {
  //       block3.push(LogicBlock.parse());
  //     }
  //   }
  //   blocks.push(block3);

  //   return {
  //     type: NodeTypeKind.Logic,
  //     kind: "if",
  //     conditions: conditions,
  //     blocks: blocks,
  //     sourceString: [IF, ifBlock, ELSEIFs, elseifBlock, ELSE, elseBlock, END]
  //       .map((o) => o.sourceString)
  //       .join(""),
  //   } as const;
  // },
  // LogicBlock_WHILE(WHILE: Node<ExpressionNodeData[]>, LogicBlocks, END): WhileStatmentData {
  //   const condition = WHILE.parse();
  //   const block = [];
  //   for (const LogicBlock of LogicBlocks.children) {
  //     block.push(LogicBlock.parse());
  //   }
  //   return {
  //     type: NodeTypeKind.Logic,
  //     name: "while",
  //     condition: condition,
  //     block: block,
  //   };
  // },
  // LogicBlock_FOREACH(FOREACH, LogicBlocks, _END): ForeachStatmentData {
  //   const condition = FOREACH.parse();
  //   const block = [];
  //   for (const LogicBlock of LogicBlocks.children) {
  //     block.push(LogicBlock.parse());
  //   }
  //   return {
  //     type: NodeTypeKind.Logic,
  //     name: "foreach",
  //     child: condition.child,
  //     children: condition.children,
  //     block: block,
  //   };
  // },
  // IF(_head, Expression: ExpressionNode) {
  //   // condtion Object
  //   return Expression.parse();
  // },
  // ELSEIF(_head, Expression: ExpressionNode) {
  //   // condtion Object
  //   return Expression.parse();
  // },
  // WHILE(_head, Expression: ExpressionNode) {
  //   // condtion Object
  //   return Expression.parse();
  // },
  // FOREACH(_head, childVar, _in, childrenVar) {
  //   // console.log(childrenVar.parse())
  //   return {
  //     child: childVar.parse(),
  //     children: childrenVar.parse(),
  //   };
  // },

  // LET(head: LabelNode, varStatment: LetAssignStatmentArrayNode): LetStatmentData {
  //   const explicit = head.parse().length > 1;
  //   return {
  //     type: NodeTypeKind.Logic,
  //     name: "let",
  //     explicit: explicit,
  //     statements: explicit && varStatment.parse(),
  //   };
  // },
  // LetAssignExpr_assign(variable: AssignExprNode) {
  //   const { value, ...other } = variable.parse();
  //   return {
  //     type: NodeTypeKind.Logic,
  //     ...other,
  //     explicit: true,
  //     left: value.left,
  //     right: value.right,
  //   };
  // },
  // LetAssignExpr_nonAssign(variable: VariableNode) {
  //   return {
  //     type: NodeTypeKind.Logic,
  //     name: "AssignExpression",
  //     explicit: true,
  //     left: variable.parse(),
  //     right: { type: NodeTypeKind.Expression, value: null } as ValueNodeData,
  //   };
  // },
  // logic_block_begin(space, app) {
  //   return app.parse();
  // },
  // logic_blockWhile(when: Node<ExpressionNodeData>, LogicBlocks, END): WhileStatmentData {
  //   const condition = when.parse();
  //   const block = [];
  //   for (const LogicBlock of LogicBlocks.children) {
  //     block.push(LogicBlock.parse());
  //   }
  //   return {
  //     type: NodeTypeKind.Logic,
  //     kind: "while",
  //     condition: condition,
  //     block: block,
  //   };
  // },
  // logic_blockForeach(FOREACH: Node<any>, LogicBlocks, _END): ForeachStatmentData {
  //   const condition = FOREACH.parse();
  //   const block = [];
  //   for (const LogicBlock of LogicBlocks.children) {
  //     block.push(LogicBlock.parse());
  //   }
  //   return {
  //     type: NodeTypeKind.Logic,
  //     kind: "foreach",
  //     child: condition.child,
  //     children: condition.children,
  //     block: block,
  //   };
  // },
  logic_blockForeach(blockNode: Node<any>): ForeachStatmentData {
    const data = blockNode.parse();
    const [condition, ...block] = data.value;
    // const condition = FOREACH.parse();
    // const block = [];
    // for (const LogicBlock of LogicBlocks.children) {
    //   block.push(LogicBlock.parse());
    // }
    return createForeachLogic(condition.child, condition.children, block, toSource(...arguments));
  },
  logic_foreach(_head, childVar: ExpressionNode, _in, childrenVar: ExpressionNode) {
    return {
      child: childVar.parse(),
      children: childrenVar.parse(),
    };
  },
  logic_if(space, Expression: ExpressionNode) {
    return Expression;
  },
  logic_elseIf(space, Expression: ExpressionNode) {
    return Expression;
  },
  logic_end(end) {
    return end;
  },
  logic_else(_else) {
    return _else;
  },
  logic_blockIf(
    IF: Node<ExpressionNode>,
    ifBlock,
    ELSEIFS,
    elseifBlock,
    ELSE,
    elseBlock,
    END: Node<Node<any>>
  ): IfStatmentData {
    // get conditions
    const ifNode = IF.parse();
    const elseIfNodes: ExpressionNode[] = [];
    const elseNode = ELSE.children[0]?.parse() as Node<any>;
    const endNode = END.parse();
    const conditions = [ifNode.parse()];
    for (const ELSEIF of ELSEIFS.children) {
      const elseIfNode: ExpressionNode = ELSEIF.parse();
      elseIfNodes.push(elseIfNode);
      conditions.push(elseIfNode.parse());
    }
    // get stroy block
    const blocks = [] as StatmentArray[];
    const blockIf = [];
    for (const LogicBlock of ifBlock.children) {
      blockIf.push(LogicBlock.parse());
    }
    blocks.push(
      createLines(blockIf, toSource(ifNode, ifBlock, elseIfNodes[0] || elseNode || endNode))
    );
    for (let index = 0; index < elseifBlock.children.length; index++) {
      const block = elseifBlock.children[index];
      const blockIfElse = [];
      // console.log(block);
      for (const LogicBlock of block.children) {
        blockIfElse.push(LogicBlock.parse());
      }
      blocks.push(
        createLines(
          blockIfElse,
          toSource(elseIfNodes[index], block, elseIfNodes[index + 1] || elseNode || endNode)
        )
      );
    }

    if (elseBlock.child(0)) {
      const blockElse = [];
      for (const LogicBlock of elseBlock.child(0).children) {
        blockElse.push(LogicBlock.parse());
      }
      blocks.push(createLines(blockElse, toSource(ELSE, elseBlock.child(0), END.parse())));
    }
    return createIfLogic(
      conditions,
      blocks,
      toSource(IF, ifBlock, ELSEIFS, elseifBlock, ELSE, elseBlock, END.parse())
    );
  },
  logicSyntax_let(head, expression: ExpressionNode) {
    const explicit = head.parse().length > 1;
    return createVariableLogic(expression.parse(), explicit, toSource(...arguments));
  },
});
export type LetAssignStatmentArrayNode = Node<LetStatmentExprData[]>;
