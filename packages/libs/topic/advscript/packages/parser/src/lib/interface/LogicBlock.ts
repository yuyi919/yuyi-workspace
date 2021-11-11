import { createKindNodeFactory, DocumentLine, NodeTypeKind, Source, StatmentArray } from ".";
import { visitExpressionNode } from "../expression";
import { BaseNodeData } from "./base";
import {
  ExpressionNodeData,
  VariableIdentifier,
  ExpressionKind,
  createLiteralExpression,
} from "./Expression";

export interface BaseLogicStatment<LogickStatmentKind> extends BaseNodeData<NodeTypeKind.Logic> {
  kind: LogickStatmentKind;
}
export enum LogickStatmentKind {
  IF,
  WHILE,
  FOREACH,
  LET,
  ASSIGN,
}
export interface IfStatmentData extends BaseLogicStatment<LogickStatmentKind.IF> {
  conditions: ExpressionNodeData[];
  blocks: StatmentArray[];
}

export interface WhileStatmentData extends BaseLogicStatment<LogickStatmentKind.WHILE> {
  condition: ExpressionNodeData;
  block: DocumentLine[];
}

export interface ForeachStatmentData extends BaseLogicStatment<LogickStatmentKind.FOREACH> {
  child: VariableIdentifier;
  children: ExpressionNodeData;
  block: DocumentLine[];
}

export interface LetStatmentData extends BaseLogicStatment<LogickStatmentKind.LET> {
  explicit: boolean;
  statements: LetStatmentExprData[];
}

export interface LetStatmentExprData extends BaseLogicStatment<LogickStatmentKind.ASSIGN> {
  explicit?: boolean;
  left: VariableIdentifier;
  right: ExpressionNodeData;
  expressionStr?: string;
}

export type LogicStatment =
  | ForeachStatmentData
  | IfStatmentData
  | LetStatmentData
  | WhileStatmentData;

export const createLogicNode = createKindNodeFactory(NodeTypeKind.Logic, LogickStatmentKind);
export function createVariableLogic(
  statements: ExpressionNodeData,
  explicit?: boolean,
  source?: Source
) {
  return createLogicNode(
    LogickStatmentKind.LET,
    {
      explicit,
      statements: visitExpressionNode(statements, (node) => {
        if (node.type === NodeTypeKind.Expression) {
          switch (node.kind) {
            case ExpressionKind.Assign: {
              const { value, ...other } = node;
              return {
                type: NodeTypeKind.Logic,
                ...other,
                kind: LogickStatmentKind.ASSIGN,
                explicit,
                left: value.left,
                right: value.right,
              };
            }
            case ExpressionKind.VariableIdentifier: {
              return {
                type: NodeTypeKind.Logic,
                kind: LogickStatmentKind.ASSIGN,
                explicit,
                left: node,
                right: createLiteralExpression(null),
              };
            }
          }
        }
      }),
    },
    source
  ) as LetStatmentData;
}
export function createIfLogic(
  conditions: ExpressionNodeData[],
  blocks: StatmentArray[],
  source?: Source
) {
  return createLogicNode(
    LogickStatmentKind.IF,
    {
      conditions,
      blocks,
    },
    source
  ) as IfStatmentData;
}

export function createForeachLogic(
  child: ExpressionNodeData,
  children: ExpressionNodeData,
  block: DocumentLine[],
  source?: Source
) {
  return createLogicNode(
    LogickStatmentKind.FOREACH,
    {
      child,
      children:
        children?.kind === ExpressionKind.Comma
          ? { ...children, kind: ExpressionKind.ArrayLiteral }
          : children,
      block: block,
    },
    source
  ) as ForeachStatmentData;
}
