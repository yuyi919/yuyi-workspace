import { createNodeError, toSource } from "../actions/_util";
import {
  ArrayNodeData,
  BinaryExpression,
  createBinaryExpression,
  defineExpressionActions,
  ExpressionKind,
  VariableIdentifier,
  LiteralExpression,
  Node,
  NodeTypeKind,
  createLiteralExpression,
  OperatorKeyword,
  createVariableIdentifier,
  createPrecetLiteralExpression,
  createIncrementExpression,
} from "../interface";
import { ExpressionNode } from "./Expression";

export type OperatorNode = Node<OperatorKeyword>;
export interface ValueNode<T = any> extends Node<LiteralExpression<T>> {}

export type VariablePrefixKeyword = "$" | "%";
export interface VariableNode extends Node<VariableIdentifier> {}

function mathExp(
  leftMode: ExpressionNode,
  operatorNode: OperatorNode,
  rightNode: ExpressionNode
): BinaryExpression {
  return createBinaryExpression(
    leftMode.parse(),
    operatorNode.parse(),
    rightNode.parse(),
    leftMode.sourceString + operatorNode.sourceString + rightNode.sourceString
  );
}

export const Exp = defineExpressionActions({
  // Exp(node) {
  //   const data = node.parse();
  //   return data instanceof Array
  //     ? data
  //     : {
  //         ...data,
  //         kindName: ExpressionKind[data.kind],
  //         source: node.sourceString,
  //       };
  // },
  /**
   * REVIEW[epic=优化] 直接使用souceString而非递归parse()
   */
  identifier(previx, content) {
    return previx.sourceString + content.sourceString;
  },
  /**
   * REVIEW[epic=优化] 直接使用souceString而非递归parse()
   */
  variableName(prefixNode, identifierNode): VariableIdentifier {
    const name = identifierNode.sourceString;
    const prefix = (prefixNode.sourceString as VariablePrefixKeyword) || null;
    return createVariableIdentifier(prefix, name);
  },
  /**
   * REVIEW[epic=优化] 直接使用souceString而非递归parse()
   */
  literalOf(node): LiteralExpression {
    const value = node.sourceString === "null" ? null : node.parse();
    return createLiteralExpression(value, toSource(node));
  },
  boolean(node) {
    return node.parse().toLowerCase() === "true";
  },
  number(node) {
    const data = node.parse();
    return typeof data === "number" ? data : Number(data);
  },
  sign_apply(text) {
    return +text.parse();
  },
  sign_signed(sign, text) {
    const value = text.parse();
    return sign.sourceString === "-" ? -value : +value;
  },
  number_fract(number, dot, decimal) {
    return (number.sourceString ?? "") + "." + decimal.sourceString;
  },
  hex(head, octdigit) {
    return "0x" + octdigit.sourceString;
  },
  percet(head, suffix) {
    return createPrecetLiteralExpression(head.parse());
  },
  ArrayElements(list): ArrayNodeData {
    return {
      type: NodeTypeKind.Expression,
      kind: ExpressionKind.ArrayLiteral,
      value: list.parse(),
    };
  },
  Array(head, list, foot): ArrayNodeData {
    return list.parse();
  },
  // string_doubleQuote(quoteA, stringContent, quoteB) {
  //   return stringContent.parse();
  // },
  // string_singleQuote(quoteA, stringContent, quoteB) {
  //   return stringContent.parse();
  // },
  AddExp_add: mathExp,
  MulExp_mul: mathExp,
  ExpExp_pow: mathExp,
  LogicExp_logic: mathExp,
  OrNullExp_or: mathExp,
  RelationExp_rel: mathExp,
  EqualExp_eq: mathExp,
  SpreadExp_spread: mathExp,
  /**
   * REVIEW[epic=结构优化] 暂时把自增/自减表达式归为BinaryExpression
   */
  IncrementExp_before(token, node) {
    return createIncrementExpression(
      node.parse(),
      token.sourceString as OperatorKeyword,
      true,
      toSource(token, node)
    );
  },
  /**
   * REVIEW[epic=结构优化]  暂时把自增/自减表达式归为BinaryExpression
   */
  IncrementExp_after(node, token) {
    return createIncrementExpression(
      node.parse(),
      token.sourceString as OperatorKeyword,
      false,
      toSource(node, token)
    );
  },
  ExpExp_invert(sign, expr: ExpressionNode) {
    const value = expr.parse();
    return createBinaryExpression(null, sign.parse(), value, sign.sourceString + expr.sourceString);
  },
  ExpExp_sign(sign, expr: ExpressionNode): BinaryExpression {
    const value = expr.parse();
    console.log(expr, expr.source.getLineAndColumn(), value);
    if (value.kind === ExpressionKind.Literal) throw createNodeError("Expected $number$ or $Exp$", expr);
    return createBinaryExpression(
      createLiteralExpression(0),
      sign.parse(),
      value,
      sign.sourceString + expr.sourceString
    );
  },
  PriExp_paren(head, MathExp, foot) {
    return MathExp.parse();
  },
});
