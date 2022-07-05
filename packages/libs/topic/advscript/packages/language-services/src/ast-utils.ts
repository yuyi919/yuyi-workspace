export * from "./ast";
import * as langium from "langium";
import * as ast from "./ast";
import { toConstMap } from "./_utils";

export class AvsAstReflection extends ast.AdvScriptAstReflection {
  isSubtype(subtype: string, supertype: string) {
    switch (subtype) {
      case ast.ModifierList_Character:
        subtype = ast.List;
        break;
      case ast.ModifierList_Macro:
        subtype = ast.List;
        break;
      case ast.ModifierList_Dialog:
        subtype = ast.List;
        break;
      case ast.VariableList:
        subtype = ast.List;
        break;

      case ast.CharactersDeclare:
        subtype = ast.Declare;
        break;
      case ast.MacroDeclare:
        subtype = ast.Declare;
        break;

      case ast.InitialExpression:
        subtype = ast.Expression;
        break;
      case ast.ParamInitialExpression:
        subtype = ast.Expression;
        break;
      case ast.PlainTextExpression:
        subtype = ast.Expression;
        break;
      case ast.TopExpression:
        subtype = ast.Expression;
        break;
    }
    if (subtype === supertype) {
      return true;
    }
    return ast.AdvScriptAstReflection.prototype.isSubtype(subtype, supertype);
  }

  isExpressionType(subtype: string) {
    return this.isSubtype(subtype, ast.Expression);
  }
}
export const astReflection = new AvsAstReflection();

export type IdentifierNode = ast.Identifier | ast.NameIdentifier | ast.VariableIdentifier;
export type IdentifierNamedNode = langium.AstNode & { name: IdentifierNode };
export type NamedNode = langium.AstNode & {
  name: IdentifierNode | string | langium.Reference<langium.AstNode>;
};
export type NamedSourceNode = langium.AstNode & { name: IdentifierNode | string };
export function isIdentifierNode(node: unknown): node is IdentifierNode {
  return (
    ast.isNameIdentifier(node) ||
    ast.isIdentifier(node) ||
    ast.isVariableIdentifier(node) ||
    ast.isDeclareKind(node)
  );
}
export function getIdentifierNodeName(node: IdentifierNode) {
  return ast.isVariableIdentifier(node) ? (node.prefix || "") + node.text : node.text;
}

export function isExpressionNodeKind(nodeName: string) {
  return astReflection.isSubtype(nodeName, ast.Expression);
}

export const AstTypes = Object.values(ast).filter((t) => typeof t === "string") as string[];
// console.log(AstTypes.filter(isExpressionNodeKind));

const REQUIRED_RULENAME = toConstMap([
  ast.WS,
  ast.CommonIndent,
  ast.EOL,
  ast.Indent,
  ast.Outdent,
  ast.CallMacro,
  ast.Content,
  ast.DeclareItem_Character,
  ast.DialogContent,
  ast.DocumentContents,
  ast.Character,
  ast.Macro,
  ast.Declare,
  ast.Space
]);
const BLOCKED_RULENAME = toConstMap([
  ast.Pipe,
  ast.Param,
  // ast.MacroParam,
  ast.Content,
  ast.Call,
  ast.Template,
  ast.Modifier,
  ast.Plain,
  ast.DeclareItem_Character,
  ast.CommonIndent,
  ast.LabelContent,
  ast.Identifier,
  ast.NameIdentifier,
  ast.DocumentContents,
  ast.PlainTextExpression,
  "RawText"
  // ast.Space,
]);
const BLOCKED_RULENAME_SCOPED = {
  [ast.DialogCall]: toConstMap([
    ast.Pipe
    // ast.MacroParam,
  ])
};
export function allowDeepResolveRuleCall(element: langium.RuleCall, root?: langium.AbstractRule) {
  return element.rule && allowRuleResolve(element.rule.ref as langium.ParserRule, root);
}
export function allowRuleResolve(element: langium.AbstractRule, root?: langium.AbstractRule) {
  return (
    isKeyword((element as langium.ParserRule).alternatives) ||
    langium.isTerminalRule((element as langium.ParserRule).alternatives) ||
    (!langium.isDataTypeRule(element as langium.ParserRule) &&
      (!root || !BLOCKED_RULENAME_SCOPED[root.name]?.[element.name]) &&
      !BLOCKED_RULENAME[element.name] &&
      element.$type !== "string" &&
      !isExpressionNodeKind(element.name))
  );
}

export function isOptionalFeature(target: langium.AbstractElement): boolean {
  return target?.cardinality && target.cardinality !== "+" && !isRequiredFeature(target);
}

export function isRequiredRuleCall(target: langium.RuleCall | langium.TerminalRuleCall): boolean {
  return target.rule && REQUIRED_RULENAME[target.rule.$refText];
}

export function isRuleCall(target: unknown, name?: string | Record<string, true>) {
  return (
    target &&
    (target as langium.AbstractElement).$type === langium.RuleCall &&
    (!name || typeof name === "string"
      ? (target as langium.RuleCall).rule.$refText === name
      : name[(target as langium.RuleCall).rule.$refText])
  );
}
/**
 * 判断ParserRuleCall
 * @param target -
 * @param source -
 */
export function isParserRuleCall(
  target: unknown,
  source: langium.ParserRule | langium.TerminalRule
) {
  return isRuleCall(target, source.name) || target === (source as langium.ParserRule).alternatives;
}

export function isRequiredFeature(target: langium.AbstractElement) {
  return target.$type === langium.RuleCall
    ? isRequiredRuleCall(target as langium.RuleCall)
    : target.$type === langium.Group
    ? false
    : false;
}

export function isKeyword(target: unknown, keyword?: string) {
  return (
    (target as langium.AstNode)?.$type === langium.Keyword &&
    (!keyword || (target as langium.Keyword).value === keyword)
  );
}

export function isKeywordRuleCall(target: unknown, keyword?: string) {
  return (
    (target as langium.AstNode)?.$type === langium.RuleCall &&
    ((target as langium.RuleCall).rule.ref as langium.ParserRule)?.alternatives?.$type ===
      langium.Keyword &&
    (!keyword ||
      (
        ((target as langium.RuleCall).rule.ref as langium.ParserRule)
          ?.alternatives as langium.Keyword
      ).value === keyword)
  );
}

export function getRuleType(rule: langium.AbstractRule): string | undefined {
  if (!rule) return;
  if (langium.isParserRule(rule)) {
    return rule.returnType?.$refText || rule.dataType;
  }
  return (rule as langium.TerminalRule).type?.name;
}
