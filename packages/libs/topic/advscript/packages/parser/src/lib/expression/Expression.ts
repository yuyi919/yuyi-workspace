import {
  AssignExprData,
  CallExpressionData,
  defineActions,
  ExpressionNodeData,
  Node,
  NodeTypeKind,
  OperatorNode,
} from "../interface";
import { VariableNode } from "./Exp";

export type AssignExprArrayNode = Node<AssignExprData[]>;
export type AssignExprNode = Node<AssignExprData>;
export type ExpressionNode = Node<ExpressionNodeData>;

export const Expression = defineActions<any>({
  Expression(node) {
    const data = node.parse();
    return data instanceof Array
      ? data
      : {
          ...data,
          source: node.sourceString,
        };
  },
  CallExpression(callName, head, args, foot): CallExpressionData {
    return {
      type: NodeTypeKind.CallExpression,
      arguments: args.parse(),
      name: callName.parse(),
    };
  },
  Exp_bool(JudgeExp: ExpressionNode, booleanOperator: OperatorNode, Exp: ExpressionNode) {
    return {
      type: NodeTypeKind.Expression,
      value: {
        left: JudgeExp.parse(),
        operator: booleanOperator.parse(),
        right: Exp.parse(),
      },
    };
  },
  JudgeExp_judge(left: ExpressionNode, operator: OperatorNode, right: ExpressionNode) {
    return {
      type: NodeTypeKind.Expression,
      value: {
        left: left.parse(),
        operator: operator.parse(),
        right: right.parse(),
      },
    };
  },
  Expression_Comma(start, content, end) {
    return content.parse().value;
  },
  Expression_Assign(variable: VariableNode, operator, Exp: ExpressionNode): AssignExprData {
    return {
      type: NodeTypeKind.Expression,
      value: {
        left: variable.parse(),
        right: Exp.parse(),
      },
    };
  },
});
