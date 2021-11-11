import { BaseNodeData, createKindNodeFactory, NodeTypeKind } from "..";

export enum ExpressionKind {
  Comma,
  Assign,
  Binary,
  VariableIdentifier,
  ArrayLiteral,
  PrecetLiteral,
  ArraySpreadLiteral,
  Literal,
  Comment,
  CallFunction,
  Template,
  CallMacro,
}

export interface BaseExpression extends BaseNodeData<NodeTypeKind.Expression> {
  kind: ExpressionKind;
  kindName?: string;
}

export const createExpression = createKindNodeFactory(NodeTypeKind.Expression, ExpressionKind);
