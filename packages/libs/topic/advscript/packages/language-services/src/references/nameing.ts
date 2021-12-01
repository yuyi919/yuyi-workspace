import { AstNode, DefaultNameProvider, findNodeForFeature, isReference, Reference } from "langium";
import { AdvscriptServices } from "../advscript-module";
import * as ast from "../ast";

export class NameProvider extends DefaultNameProvider {
  reflection: ast.AdvscriptAstReflection;
  constructor(services: AdvscriptServices) {
    super();
    this.reflection = services.AstReflection;
  }

  getReferenceName(refId: ast.AdvscriptAstReference | ({} & string), reference: Reference) {
    const refType = this.reflection.getReferenceType(refId as ast.AdvscriptAstReference);
    // const  fr = (reference.$refNode as CompositeCstNode).feature.$container
    // if (isAssignment(fr)) {
    //   const referenceId = getReferenceId(reference.$container, fr.feature)
    // }
    return `(${refType})${reference.$refText}`;
  }

  isIdentifierRef(refType: ast.AdvscriptAstReference | ({} & string)) {
    return refType === ast.Identifier || refType === ast.NameIdentifier;
  }
  getReferenceNodeName(
    refId: ast.AdvscriptAstReference | ({} & string),
    reference: Reference,
    container: AstNode
  ) {
    const refType = this.reflection.getReferenceType(refId as ast.AdvscriptAstReference);
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
    if (ast.isDialogModifier(container)) {
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
    // console.log("getReferenceNodeName: " + refType + "=>" + containerKey, reference);
    return Array.from(new Set([containerKey, key]))
      .filter(Boolean)
      .join(".");
  }

  isNamedRefNode(node: unknown): node is AstNode & { ref: Reference<AstNode> } {
    return node && isReference((node as any).ref);
  }

  getName(node: AstNode | Reference | string): string | undefined {
    if (!node) return;
    if (typeof node === "string") {
      return node;
    }
    if (isReference(node)) {
      return node.$refText;
    }
    if (this.isNamedRefNode(node) && node.ref.$refText) {
      return `(${node.$type})` + node.ref.$refText;
    }
    if (ast.isIdentifier(node) || ast.isNameIdentifier(node)) {
      return node.text;
    }
    if (ast.isQualifiedName(node)) {
      return node.name.map((name) => name.$refText).join(".");
    }
    if (this.isNamed(node)) {
      if (isReference(node.name)) {
        return node.name.$refText; // return createNodeName(node.$container, node.name);
      }
      if (typeof node.name === "string") {
        return `(${node.$type})` + node.name;
      }
      return `(${node.$type})` + node.name.text;
    }
    return super.getName(node);
  }

  isNamed(node: AstNode): node is ast.NamedNode {
    const { name } = node as any;
    return isReference(name) || this.isIdentifier(name) || typeof name === "string";
  }

  isNamedWithIdentifier(node: AstNode): node is ast.IdentifierNamedNode {
    const { name } = node as any;
    return this.isIdentifier(name);
  }

  getNameNode(node: AstNode) {
    return (
      this.getIdentifierNameFeature(node) ||
      findNodeForFeature(node.$cstNode, "kind") ||
      findNodeForFeature(node.$cstNode, "name") ||
      findNodeForFeature(node.$cstNode, "ref")
    );
  }

  isIdentifier(node: unknown) {
    return ast.isNameIdentifier(node) || ast.isIdentifier(node);
  }
  getIdentifierNameFeature(node: AstNode) {
    return (
      (this.isNamedWithIdentifier(node) && this.getIdentifierNameFeature(node.name)) ||
      (this.isIdentifier(node) && findNodeForFeature(node.$cstNode, "text"))
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
    return [container, this.isIdentifier(name) ? "name" : this.getName(name)]
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
