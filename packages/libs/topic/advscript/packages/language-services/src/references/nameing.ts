import {
  AstNode,
  CrossReference,
  CstNode,
  DefaultNameProvider,
  findNodeForFeature,
  isReference,
  Reference,
} from "langium";
import { AdvScriptServices } from "../advscript-module";
import * as ast from "../ast-utils";

export class NameProvider extends DefaultNameProvider {
  reflection: ast.AdvScriptAstReflection;
  constructor(services: AdvScriptServices) {
    super();
    this.reflection = services.shared.AstReflection;
  }

  getReferenceName(refId: ast.AdvScriptAstReference | ({} & string), reference: Reference) {
    const refType = this.reflection.getReferenceType(refId as ast.AdvScriptAstReference);
    // const  fr = (reference.$refNode as CompositeCstNode).feature.$container
    // if (isAssignment(fr)) {
    //   const referenceId = getReferenceId(reference.$container, fr.feature)
    // }
    return `(${refType})${reference.$refText}`;
  }

  isIdentifierRef(refType: string) {
    return ast.isIdentifierNode({ $type: refType });
  }

  getReferenceNodeName(
    refId: ast.AdvScriptAstReference | ({} & string),
    reference: Reference,
    container: AstNode
  ) {
    const refType = this.reflection.getReferenceType(refId as ast.AdvScriptAstReference);
    const key: string = this.isIdentifierRef(refType)
      ? "name"
      : this.getReferenceName(refId, reference);
    let containerKey: string = "";
    if (ast.isDialog(container)) {
      containerKey = `(${ast.Character})` + reference.$refText;
    }
    if (ast.isMacro(container)) {
      containerKey = `(${ast.Character})` + reference.$refText;
    }
    if (ast.isModifierRef(container)) {
      containerKey = `(${ast.Character})` + container.$container.ref.$refText;
    }
    if (ast.isAtInline(container)) {
      containerKey = `(${ast.Character})` + container.ref.$refText;
    }
    if (ast.isMacroParam(container) && refType === ast.Param) {
      containerKey = `(${ast.Macro})` + container.$container.ref.$refText;
    }
    if (ast.isQualifiedName(container)) {
      containerKey = container.name
        .slice(0, container.name.indexOf(reference as Reference<ast.Identifier>))
        .map((name) => name.$refText)
        .join(".");
    }
    const name = Array.from(new Set([containerKey, key]))
      .filter(Boolean)
      .join(".");
    // console.log("getReferenceNodeName: " + refType + "=>" + name, reference);
    return name;
  }

  isNamedRefNode(node: unknown): node is AstNode & { ref: Reference<AstNode> } {
    return node && isReference((node as any).ref);
  }

  getName(node: AstNode | Reference | string): string | undefined {
    return this.getNameWith(node, true);
  }
  getDisplayName(node: AstNode | Reference | string): string | undefined {
    if (ast.isDialog(node)) return this.getDialogName(node);
    if (ast.isAction(node)) return this.getActionName(node);
    if (ast.isAtInline(node)) return this.getAtName(node);
    if (ast.isLogicStatment(node)) return node.$cstNode.text;
    return this.getNameWith(node);
  }

  getInputText(node: AstNode | Reference | string): string | undefined {
    return this.getNameWith(node);
  }

  getDialogName(node: ast.Dialog): string {
    return `@${node.ref.$refText}: ${node.contents.map((line) => line.$cstNode.text).join("\n")}`;
  }
  getAtName(node: ast.AtInline): string {
    return `@${node.ref.$refText}`;
  }
  getActionName(node: ast.Action): string {
    return `@: ${node.$cstNode.text}`;
  }
  protected getNameWith(
    node: AstNode | Reference | string,
    typed = false,
    container?: AstNode
  ): string | undefined {
    if (!node) return;
    if (typeof node === "string") {
      return node;
    }
    if (isReference(node)) {
      return this._getTypeName(node, typed, container) + node.$refText;
    }
    if (this.isNamedRefNode(node)) {
      return this.getNameWith(node.ref, typed, node);
    }
    if (ast.isIdentifierNode(node)) {
      return ast.getIdentifierNodeName(node);
    }
    if (ast.isQualifiedName(node)) {
      return node.name.map((name) => this.getNameWith(name, typed, node)).join(".");
    }
    if (this.isNamed(node)) {
      return this._getTypeName(node.$type, typed) + this.getNameWith(node.name, typed, node);
    }
    return super.getName(node);
  }

  private _getTypeName(
    node: string | AstNode | Reference,
    typed?: boolean,
    container?: string | AstNode
  ) {
    if (isReference(node)) node = (node.$refNode.feature as CrossReference).type.$refText;
    if (typeof node !== "string") node = node.$type;
    if (container && typeof container !== "string") container = container.$type;
    return typed ? `(${[container, node].filter(Boolean).join("::")})` : "";
  }

  isNamed(node: AstNode): node is ast.NamedNode {
    const { name } = node as any;
    return isReference(name) || ast.isIdentifierNode(name) || typeof name === "string";
  }
  isNamedSourceNode(node: AstNode): node is ast.NamedSourceNode {
    const { name } = node as any;
    return ast.isIdentifierNode(name) || typeof name === "string";
  }

  isNamedWithIdentifier(node: AstNode): node is ast.IdentifierNamedNode {
    const { name } = node as any;
    return ast.isIdentifierNode(name);
  }

  getNameNode(node: AstNode) {
    if (ast.isAction(node)) {
      return node.$cstNode;
    }
    return (
      this.getIdentifierNameFeature(node) ||
      findNodeForFeature(node.$cstNode, "kind") ||
      findNodeForFeature(node.$cstNode, "name") ||
      findNodeForFeature(node.$cstNode, "ref")
    );
  }

  getIdentifierNameFeature(node: AstNode): CstNode {
    return (
      (this.isNamedWithIdentifier(node) && this.getIdentifierNameFeature(node.name)) ||
      (ast.isIdentifierNode(node) &&
        (ast.isVariableIdentifier(node)
          ? node.$cstNode
          : findNodeForFeature(node.$cstNode, "text")))
    );
  }

  /**
   * @param qualifier if the qualifier is a `string`, simple string concatenation is done: `qualifier.name`.
   *      if the qualifier is a `PackageDeclaration` fully qualified name is created: `package1.package2.name`.
   * @param name simple name
   * @returns qualified name separated by `.`
   */
  getQualifiedName(
    qualifier: ast.Character | ast.Modifier | ast.Macro | AstNode | string,
    name: string | AstNode
  ): string {
    let prefix = qualifier;
    if (this.isDeepElementNode(qualifier)) {
      prefix = this.isDeepPathedNode(qualifier.$container)
        ? this.getQualifiedName(qualifier.$container, this.getName(qualifier)!)
        : this.getName(qualifier)!;
    }
    const container = typeof prefix === "string" ? prefix : "";
    return [container, ast.isIdentifierNode(name) ? "name" : this.getName(name)]
      .filter(Boolean)
      .join(".");
  }

  isDeepPathedNode(target: AstNode): target is ast.CharactersDeclare | ast.MacroDeclare {
    return ast.isCharactersDeclare(target) || ast.isMacroDeclare(target);
  }
  isDeepElementNode(target: AstNode | string): target is ast.Character | ast.Modifier | ast.Macro {
    return ast.isCharacter(target) || ast.isModifier(target) || ast.isMacro(target);
  }
}
