import { Node, defineActions, OperatorNode, OperatorKeyword } from "../interface";
import { ArrayNodeData, ValueNodeData } from "./base";
import { VariableNodeData } from "./arithmetic";

export const Expression = defineActions({
  Exp_bool(JudgeExp: ExpressionNode, booleanOperator: OperatorNode, Exp: ExpressionNode) {
    return {
      type: "expression",
      value: {
        left: JudgeExp.parse(),
        operator: booleanOperator.parse(),
        right: Exp.parse(),
      },
    };
  },
  JudgeExp_judge(left: ExpressionNode, operator: OperatorNode, right: ExpressionNode) {
    return {
      type: "expression",
      value: {
        left: left.parse(),
        operator: operator.parse(),
        right: right.parse(),
      },
    };
  },
});

export interface BinaryExpressionNodeData {
  type: "expression";
  value: {
    left: ExpressionNodeData;
    operator: OperatorKeyword;
    right: ExpressionNodeData;
  };
}

export type ExpressionNodeData =
  | ValueNodeData
  | ArrayNodeData
  | VariableNodeData
  | BinaryExpressionNodeData;
export type ExpressionNode = Node<ExpressionNodeData>;
