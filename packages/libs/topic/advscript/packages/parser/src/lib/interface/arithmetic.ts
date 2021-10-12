// import { defineActions, Node, OperatorNode } from "../interface";
// import { BinaryExpressionNodeData, ExpressionNode } from "./Expression";

export type VariablePrefixKeyword = "$" | "%";
export interface VariableNodeData {
  type: "variable";
  prefix?: VariablePrefixKeyword | null;
  value?: string;
  expressionStr?: string
}
// export interface VariableNode extends Node<VariableNodeData> {}

// export const Variable = ({
//   Identifier(prefix: Node<VariablePrefixKeyword>, n: Node<string>): VariableNodeData {
//     return {
//       type: "variable",
//       prefix: prefix.parse() || null,
//       value: n.parse(),
//     };
//   },
// });

// function mathExp(
//   left: ExpressionNode,
//   operator: OperatorNode,
//   right: ExpressionNode
// ): BinaryExpressionNodeData {
//   return {
//     type: "expression",
//     value: {
//       left: left.parse(),
//       operator: operator.parse(),
//       right: right.parse(),
//     },
//   };
// }

// export const Arithmetic = ({
//   AddExp_add: mathExp,
//   MulExp_mul: mathExp,
//   ExpExp_power: mathExp,
//   PriExp_paren(head, MathExp, foot) {
//     return MathExp.parse();
//   },
//   PriExp_neg(neg, PriExp: ExpressionNode): BinaryExpressionNodeData {
//     return {
//       type: "expression",
//       value: {
//         left: {
//           type: "value",
//           value: 0,
//         },
//         operator: "-",
//         right: PriExp.parse(),
//       },
//     };
//   },
//   PriExp_pos(pos, PriExp: ExpressionNode): BinaryExpressionNodeData {
//     return {
//       type: "expression",
//       value: {
//         left: {
//           type: "value",
//           value: 0,
//         },
//         operator: "+",
//         right: PriExp.parse(),
//       },
//     };
//   },
// });
