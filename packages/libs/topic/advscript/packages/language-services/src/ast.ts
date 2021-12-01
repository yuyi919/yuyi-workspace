export * from "./generated/ast";
import { AstNode, Reference } from "langium";
import type * as ast from "./generated/ast";

export type IdentifierNode = ast.Identifier | ast.NameIdentifier;
export type IdentifierNamedNode = AstNode & { name: IdentifierNode };
export type NamedNode = AstNode & { name: IdentifierNode | string | Reference<AstNode> };
