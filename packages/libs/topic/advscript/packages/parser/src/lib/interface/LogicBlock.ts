import { StatementData } from ".";
import { BaseNodeData } from "./base";
import { ExpressionNodeData, IdentifierData } from "./Expression";

export interface LogicStatmentData extends BaseNodeData {
  type: "logic";
  name: string;
}
export interface IfStatmentData extends LogicStatmentData {
  name: "if";
  conditions: ExpressionNodeData[][];
  blocks: StatementData[][];
}

export interface WhileStatmentData extends LogicStatmentData {
  name: "while";
  condition: ExpressionNodeData[];
  block: StatementData[];
}

export interface ForeachStatmentData extends LogicStatmentData {
  name: "foreach";
  child: IdentifierData;
  children: ExpressionNodeData;
  block: StatementData[];
}

export interface LetStatmentData extends LogicStatmentData {
  name: "let";
  explicit: boolean;
  statements: LetStatmentExprData[];
}

export interface LetStatmentExprData extends LogicStatmentData {
  name: "AssignExpression";
  explicit: boolean;
  left: IdentifierData;
  right: ExpressionNodeData;
  expressionStr?: string;
}
