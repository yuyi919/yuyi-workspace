import { BaseNodeData } from "../base";
import { InlineCommentNodeData } from "../Comment";
import { NodeTypeKind } from "../index";
import { BinaryExpression } from "./BinaryExpression";
import { CallExpression, CallMacroExpression } from "./CallExpression";
import { BaseExpression, ExpressionKind } from "./ExpressionKind";
import { VariableIdentifier } from "./Identifier";
import { LiteralExpression, PrecetLiteralExpression } from "./LiteralExpression";

export type ExpressionNodeData =
  | CommaExpression
  | LiteralExpression
  | PrecetLiteralExpression
  | ArrayNodeData
  | BinaryExpression
  | AssignExprData
  | InlineCommentNodeData
  | TemplateExpression
  | CallExpression
  | CallMacroExpression
  | VariableIdentifier;

export interface CommaExpression extends BaseExpression {
  kind: ExpressionKind.Comma;
  value: ExpressionNodeData[];
  expressionStr?: string;
}
export interface AssignExprData extends BaseExpression {
  kind: ExpressionKind.Assign;
  value: {
    left: VariableIdentifier;
    right: ExpressionNodeData;
  };
  expressionStr?: string;
}

export interface TemplateExpression extends BaseExpression {
  kind: ExpressionKind.Template;
  value: ExpressionNodeData;
  pipe?: CallMacroExpression;
}

export interface ArraySpreadExpressionData extends BaseNodeData {
  type: NodeTypeKind.Expression;
  kind: ExpressionKind.ArraySpreadLiteral;
  start?: ExpressionNodeData;
  end?: ExpressionNodeData;
  expressionStr?: string;
}

export interface ArrayExpressionData extends BaseNodeData {
  type: NodeTypeKind.Expression;
  kind: ExpressionKind.ArrayLiteral;
  value?: ExpressionNodeData[];
  expressionStr?: string;
}

export type ArrayNodeData = ArrayExpressionData | ArraySpreadExpressionData;

export * from "./BinaryExpression";
export * from "./CallExpression";
export * from "./ExpressionKind";
export * from "./Identifier";
export * from "./LiteralExpression";

