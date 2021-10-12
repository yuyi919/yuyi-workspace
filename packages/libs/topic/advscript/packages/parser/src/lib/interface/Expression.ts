// import { Node, defineActions, OperatorNode, OperatorKeyword } from "../interface";
import { ArrayNodeData, ValueNodeData } from "./base";
import { VariableNodeData } from "./arithmetic";
import { OperatorKeyword } from "./index";
import ts from 'typescript'
// export const Expression = defineActions({
//   Exp_bool(JudgeExp: ExpressionNode, booleanOperator: OperatorNode, Exp: ExpressionNode) {
//     return {
//       type: "expression",
//       value: {
//         left: JudgeExp.parse(),
//         operator: booleanOperator.parse(),
//         right: Exp.parse(),
//       },
//     };
//   },
//   JudgeExp_judge(left: ExpressionNode, operator: OperatorNode, right: ExpressionNode) {
//     return {
//       type: "expression",
//       value: {
//         left: left.parse(),
//         operator: operator.parse(),
//         right: right.parse(),
//       },
//     };
//   },
// });
export interface BinaryExpressionNodeData {
  type: "expression";
  value: {
    left: ExpressionNodeData;
    operator: OperatorKeyword;
    right: ExpressionNodeData;
  };
  expressionStr?: string;
}

// export interface AssignmentExpressionNodeData {
//   type: "expression";
//   value: {
//     left: ExpressionNodeData;
//     right: ExpressionNodeData;
//   }[];
//   expressionStr?: string;
// }
export type ExpressionNodeData =
  | ValueNodeData
  | ArrayNodeData
  | VariableNodeData
  | BinaryExpressionNodeData
  // | AssignmentExpressionNodeData;
