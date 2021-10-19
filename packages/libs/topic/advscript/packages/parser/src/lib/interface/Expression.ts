// import { Node, defineActions, OperatorNode, OperatorKeyword } from "../interface";
import { BaseNodeData } from "./base";
import { NodeTypeKind, OperatorKeyword } from "./index";

export enum ExpressionKind {
  String,
  Number,
  Boolean,
  Identifier,
}

export interface ExpressionData extends BaseNodeData {
  type: NodeTypeKind.Expression;
}

export interface BinaryExpressionNodeData extends ExpressionData {
  value: {
    left: ExpressionNodeData;
    operator: OperatorKeyword;
    right: ExpressionNodeData;
  };
  expressionStr?: string;
}
export interface AssignExprData extends ExpressionData {
  value: {
    left: IdentifierData;
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
  | IdentifierData
  | BinaryExpressionNodeData
  | AssignExprData;
// | AssignmentExpressionNodeData;

export interface NodeArrayData<T extends BaseNodeData = BaseNodeData> extends BaseNodeData {
  type: "NodeArray";
  value: T[];
}

export interface ValueNodeData<T = any> extends BaseNodeData {
  type: NodeTypeKind.Raw;
  value?: T;
  expressionStr?: string;
}
export interface ArraySpreadExpressionData extends BaseNodeData {
  type: NodeTypeKind.ArraySpread;
  start?: ValueNodeData<number>;
  end?: ValueNodeData<number>;
  expressionStr?: string;
}
export interface ArrayExpressionData extends BaseNodeData {
  type: NodeTypeKind.Array;
  value?: ExpressionNodeData[];
  expressionStr?: string;
}
export type ArrayNodeData = ArrayExpressionData | ArraySpreadExpressionData;

export type IdentifierPrefixKeyword = "$" | "%";
export interface IdentifierData extends BaseNodeData {
  type: NodeTypeKind.Identifier;
  prefix?: IdentifierPrefixKeyword | null;
  value?: string;
  expressionStr?: string;
}
