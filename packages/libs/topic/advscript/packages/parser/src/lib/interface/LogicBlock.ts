import { StatementData } from ".";
import { VariableNodeData } from "./arithmetic";
import { ExpressionNodeData } from "./Expression";

export interface LogicStatmentData {
  type: "logic";
  name: string;
}
export interface IfStatmentData extends LogicStatmentData {
  name: "if";
  conditions: ExpressionNodeData[];
  blocks: StatementData[];
}

export interface WhileStatmentData extends LogicStatmentData {
  name: "while";
  condition: ExpressionNodeData[];
  block: StatementData[];
}

export interface ForeachStatmentData extends LogicStatmentData {
  name: "foreach";
  child: VariableNodeData;
  children: ExpressionNodeData;
  block: StatementData[];
}

export interface LetStatmentData extends LogicStatmentData {
  name: "let";
  explicit: boolean;
  statements: LetStatmentExprData[];
}

export interface LetStatmentExprData extends LogicStatmentData {
  name: "VariableDeclaration";
  explicit: boolean;
  left: VariableNodeData;
  right: ExpressionNodeData;
  expressionStr?: string
}
