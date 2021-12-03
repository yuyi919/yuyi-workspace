export * from "./generated/ast";
import { AstNode, Reference } from "langium";
import { isNameIdentifier, isIdentifier, isDeclareKind } from "./generated/ast";
import type * as ast from "./generated/ast";

export type IdentifierNode = ast.Identifier | ast.NameIdentifier;
export type IdentifierNamedNode = AstNode & { name: IdentifierNode };
export type NamedNode = AstNode & { name: IdentifierNode | string | Reference<AstNode> };
export type NamedSourceNode = AstNode & { name: IdentifierNode | string };
export function isIdentifierNode(node: unknown): node is IdentifierNode {
  return isNameIdentifier(node) || isIdentifier(node) || isDeclareKind(node);
}
