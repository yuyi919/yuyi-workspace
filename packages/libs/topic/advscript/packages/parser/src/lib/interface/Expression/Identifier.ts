import { createExpression, NodeTypeKind } from "..";
import { BaseExpression } from "./index";
import { ExpressionKind } from "./ExpressionKind";

export interface VariableIdentifier extends BaseExpression {
  kind: ExpressionKind.VariableIdentifier;
  prefix?: VariableNamePrefix | null;
  text?: string;
  expressionStr?: string;
}
export type VariableNamePrefix = "$" | "%";

export function createVariableIdentifier(
  prefix: VariableNamePrefix | null,
  name: string
): VariableIdentifier {
  return createExpression(
    ExpressionKind.VariableIdentifier,
    {
      kindName: ExpressionKind[ExpressionKind.VariableIdentifier],
      prefix,
      text: name,
    } as VariableIdentifier,
    prefix ? prefix + name : name
  );
}
