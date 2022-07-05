import { createVariableIdentifier, Source } from "..";
import { createExpression, ExpressionKind } from "./ExpressionKind";
import { BaseExpression, ExpressionNodeData } from "./index";

type ExprKinds =
  | BinaryExpressionKind.OrNull
  | BinaryExpressionKind.Logic
  | BinaryExpressionKind.Realtion
  | BinaryExpressionKind.Addition
  | BinaryExpressionKind.Multiplication
  | BinaryExpressionKind.Automic;
enum BinaryExpressionKind {
  OrNull,
  Logic,
  Realtion,
  Addition,
  Multiplication,
  Automic
}
export interface BinaryExpression<Kind extends ExprKinds = ExprKinds> extends BaseExpression {
  kind: ExpressionKind.Binary;
  value: {
    kind: Kind;
    left: ExpressionNodeData;
    operator: OperatorKeyword;
    right: ExpressionNodeData;
  };
  expressionStr?: string;
}

export enum OrNullOpertaor {
  "??"
}
export enum LogicOpertaor {
  "||",
  "&&"
}
export enum EqualOpertaor {
  "!=",
  "=="
}
export enum RealtionOpertaor {
  ">=",
  "<=",
  ">",
  "<"
}
export enum AdditionOpertaor {
  "+",
  "-"
}
export enum MultiplicationOpertaor {
  "%",
  "/",
  "*"
}
export enum AutomicOpertaor {
  "^",
  "!"
}
export enum IncrementOpertaor {
  "++",
  "--"
}
export type OperatorKeyword =
  | keyof typeof OrNullOpertaor
  | keyof typeof LogicOpertaor
  | keyof typeof EqualOpertaor
  | keyof typeof RealtionOpertaor
  | keyof typeof AdditionOpertaor
  | keyof typeof MultiplicationOpertaor
  | keyof typeof IncrementOpertaor
  | keyof typeof AutomicOpertaor;

export function createBinaryExpression(
  left: ExpressionNodeData,
  operator: OperatorKeyword,
  right: ExpressionNodeData,
  source?: Source
): BinaryExpression {
  let kind: BinaryExpressionKind;
  if (kind in OrNullOpertaor) {
    kind = BinaryExpressionKind.OrNull;
  } else if (kind in LogicOpertaor) {
    kind = BinaryExpressionKind.Logic;
  } else if (kind in RealtionOpertaor) {
    kind = BinaryExpressionKind.Realtion;
  } else if (kind in AdditionOpertaor) {
    kind = BinaryExpressionKind.Addition;
  } else if (kind in MultiplicationOpertaor) {
    kind = BinaryExpressionKind.Multiplication;
  } else if (kind in AutomicOpertaor || kind in IncrementOpertaor) {
    kind = BinaryExpressionKind.Automic;
  }
  return createExpression(
    ExpressionKind.Binary,
    {
      value: {
        kind,
        left,
        operator,
        right
      }
    } as BinaryExpression,
    source
  );
}

export function createIncrementExpression(
  identifier: ExpressionNodeData | string,
  operator: OperatorKeyword,
  before: boolean,
  source?: Source
) {
  const name =
    typeof identifier === "string" ? createVariableIdentifier(null, identifier) : identifier;
  return createExpression(
    ExpressionKind.Binary,
    {
      value: before
        ? {
            kind: BinaryExpressionKind.Automic,
            left: null,
            operator,
            right: name
          }
        : {
            kind: BinaryExpressionKind.Automic,
            left: name,
            operator,
            right: null
          }
    } as BinaryExpression,
    source
  );
}
