import { BaseExpression } from "./index";
import { createExpression, ExpressionKind } from "./ExpressionKind";
import { Source } from "..";

export interface PrecetLiteralExpression extends BaseExpression {
  kind: ExpressionKind.PrecetLiteral;
  value: number;
  expressionStr?: string;
}

export interface LiteralExpression<T = any> extends BaseExpression {
  kind: ExpressionKind.Literal;
  value?: T;
  expressionStr?: string;
}
export function createLiteralExpression(value: any, source?: Source): LiteralExpression<any> {
  return createExpression(
    ExpressionKind.Literal,
    {
      value,
    },
    source ?? JSON.stringify(value)
  );
}

export function createPrecetLiteralExpression(
  value: number,
  source?: Source
): PrecetLiteralExpression {
  return createExpression(
    ExpressionKind.PrecetLiteral,
    {
      value,
    },
    source ?? value + "%"
  );
}
