import { toSource } from "../actions/_util";
import {
  AssignExprData,
  CallExpression,
  CommaExpression,
  defineExpressionActions,
  ExpressionKind,
  ExpressionNodeData,
  Node,
  NodeTypeKind,
  TemplateExpression,
  CallMacroExpression,
  createCallExpression,
  BinaryExpression,
  ArraySpreadExpressionData,
  createExpression,
  createBinaryExpression,
} from "../interface";
import { OperatorNode, VariableNode } from "./Exp";

export type AssignExprArrayNode = Node<AssignExprData[]>;
export type AssignExprNode = Node<AssignExprData>;
export type ExpressionNode = Node<ExpressionNodeData>;
export type CommaExpressionNode = Node<CommaExpression>;
export type CallMacroExpressionNode = Node<CallMacroExpression>;
export type TemplateExpressionNode = Node<TemplateExpression>;
export type CallExpressionNode = Node<CallExpression>;

export function visitExpressionNode<Node extends ExpressionNodeData, T>(
  data: Node,
  visitor: (node: ExpressionNodeData) => T
): T[] {
  if (data.kind === ExpressionKind.Comma) {
    return data.value.map(visitor);
  }
  return [visitor(data)] as any;
}
export const Expression = defineExpressionActions<any>({
  Template(_, expr: ExpressionNode, pipe, $): TemplateExpression {
    return {
      type: NodeTypeKind.Expression,
      kind: ExpressionKind.Template,
      value: expr.parse(),
      pipe: pipe.parse(),
    };
  },
  CallExpression(name, head, args, foot): CallExpression {
    return createCallExpression(name.parse(), args.parse(), toSource(name, head, args, foot));
  },
  TopExp_ArraySpread(spread: Node<BinaryExpression>): ArraySpreadExpressionData {
    const { value } = spread.parse();
    return {
      type: NodeTypeKind.Expression,
      kind: ExpressionKind.ArraySpreadLiteral,
      start: value.left,
      end: value.right,
    };
  },
  Exp_Comma(node, _, nextNode: ExpressionNode): CommaExpression {
    const data = node.parse();
    const next = nextNode.parse();
    return createExpression(ExpressionKind.Comma, {
      value: next.kind === ExpressionKind.Comma ? [data, ...next.value] : [data, next],
    }) as CommaExpression;
  },
  TopExp_assign(variable: VariableNode, _, Exp: ExpressionNode): AssignExprData {
    return createExpression(ExpressionKind.Assign, {
      value: {
        left: variable.parse(),
        right: Exp.parse(),
      },
    });
  },
});
