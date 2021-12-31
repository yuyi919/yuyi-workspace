export * from "./ast";
import type langium from "langium";
import { isDataTypeRule, isKeyword, RuleCall } from "langium";
import * as ast from "./ast";
import {
  Expression,
  InitialExpression,
  isDeclareKind,
  isIdentifier,
  isNameIdentifier,
  isVariableIdentifier,
  ParamInitialExpression,
  reflection,
  TopExpression,
} from "./generated/ast";
import { toConstMap } from "./_utils";

export type IdentifierNode = ast.Identifier | ast.NameIdentifier | ast.VariableIdentifier;
export type IdentifierNamedNode = langium.AstNode & { name: IdentifierNode };
export type NamedNode = langium.AstNode & {
  name: IdentifierNode | string | langium.Reference<langium.AstNode>;
};
export type NamedSourceNode = langium.AstNode & { name: IdentifierNode | string };
export function isIdentifierNode(node: unknown): node is IdentifierNode {
  return (
    isNameIdentifier(node) ||
    isIdentifier(node) ||
    isVariableIdentifier(node) ||
    isDeclareKind(node)
  );
}
export function getIdentifierNodeName(node: IdentifierNode) {
  return isVariableIdentifier(node) ? (node.prefix || "") + node.text : node.text;
}
export function isExpressionNodeKind(nodeName: string) {
  return (
    reflection.isSubtype(nodeName, Expression) ||
    reflection.isSubtype(nodeName, InitialExpression) ||
    reflection.isSubtype(nodeName, ParamInitialExpression) ||
    reflection.isSubtype(nodeName, TopExpression)
  );
}

const REQUIRED_RULENAME = toConstMap([ast.WS, ast.CommonIndent, ast.Indent, ast.Outdent]);
const BLOCKED_RULENAME = toConstMap([
  ast.Pipe,
  ast.Param,
  ast.MacroParam,
  ast.Content,
  ast.Call,
  ast.Template,
  ast.ESCToken,
  ast.Modifier,
  ast.Plain,
  ast.ESCToken,
  ast.Character,
  ast.CommonIndent,
  ast.LabelContent,
]);
export function isResolvableRuleCall(element: langium.RuleCall) {
  return isResolvableRule(element.rule.ref as langium.ParserRule);
}
export function isResolvableRule(element: langium.ParserRule) {
  return (
    isKeyword(element.alternatives) ||
    (!isDataTypeRule(element) &&
      !BLOCKED_RULENAME[element.name] &&
      element.type !== "string" &&
      !isExpressionNodeKind(element.name))
  );
}
export function isOptionalFeature(target: langium.AbstractElement): unknown {
  return target?.cardinality && target.cardinality !== "+" && !isRequiredFeature(target);
}

export function isRequiredRuleCall(target: langium.RuleCall | langium.TerminalRuleCall) {
  return REQUIRED_RULENAME[target.rule.$refText];
}

export function isRequiredFeature(target: langium.AbstractElement) {
  return target.$type === RuleCall && isRequiredRuleCall(target as langium.RuleCall);
}
