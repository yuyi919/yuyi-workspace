/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable tsdoc/syntax */
/* eslint-disable @typescript-eslint/naming-convention */
import { timeStamp } from "console";
import {
  AstNode,
  CrossReference,
  CstNode,
  DefaultNameProvider,
  findNodeForFeature,
  isAstNode,
  isReference,
  Reference
} from "langium";
import { AdvScriptServices } from "../advscript-module";
import * as ast from "../ast-utils";
import { Trie } from "../libs";
import { toConstMap } from "../_utils";

export class NameProvider extends DefaultNameProvider {
  reflection: ast.AdvScriptAstReflection;
  nestRefs: Trie.Trie;
  constructor(services: AdvScriptServices) {
    super();
    this.reflection = services.shared.AstReflection;
    this.nestRefs = Trie.fromKeysList([
      [ast.Param, ast.Macro],
      [ast.Param, ast.Character],
      [ast.Modifier, ast.Character]
    ]);
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
    const astNodes =
      this.isNamedRefNode(container) || this.isIdentifierRef(refType)
        ? this.getQualifiedNameStack(container.$container, container)
        : this.getQualifiedNameStack(container, this.getReferenceName(refId, reference));
    if (astNodes.length) {
      let index = 0,
        result = this.getNameStackItemName(astNodes[0], false);
      while (++index < astNodes.length) {
        result += "." + this.getNameStackItemName(astNodes[index], false);
      }
      return result;
    }
  }

  isNamedRefNode(node: unknown): node is AstNode & { ref: Reference<AstNode> } {
    return node && isReference((node as any).ref);
  }

  getName(node: AstNode | Reference | string): string | undefined {
    const name = this.getNameWith(node, true);
    return name;
  }
  getNameID(node: AstNode | Reference | string): string | undefined {
    return this.getNameWith(node);
  }
  getPlainName(node: AstNode | Reference | string): string | undefined {
    // console.log("getName: ", this.getNameWith(node, true));
    return this.getNameID(node);
  }
  getDisplayName(node: AstNode | Reference | string): string | undefined {
    if (ast.isDialog(node)) return this.getDialogName(node);
    if (ast.isAction(node)) return this.getActionName(node);
    if (ast.isAtInline(node)) return this.getAtName(node);
    if (ast.isLogicStatment(node)) return node.$cstNode.text;
    return this.getNameID(node);
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
    return this.getNamesWith(
      node,
      (node, container) => {
        if (typeof node === "string") {
          return node;
        }
        if (isReference(node)) {
          return (
            (typed ? this.getNameWithStackItemType(node, container, false) : "") + node.$refText
          );
        }
        if (this.isNamedRefNode(node)) {
          return this.getNameWith(node.ref, typed, node);
        }
        if (ast.isIdentifierNode(node)) {
          return ast.getIdentifierNodeName(node);
        }
        if (this.isNamed(node)) {
          return (
            (typed ? this.getNameWithStackItemType(node.$type, container) : "") +
            this.getNameWith(node.name, typed, node)
          );
        }
        return super.getName(node);
      },
      container
    )?.join(".");
  }

  getNameStackItemName(search: NameStackItem, refPrefix: boolean) {
    let r = search.name;
    if (search.type) {
      for (const type of search.type) {
        r = this.getNameWithStackItemType(type, refPrefix) + r;
      }
    }
    return r;
  }

  getNameStack(node: AstNode | Reference | string, container?: AstNode): NameStackItem[] {
    if (!node) return;
    return this.getNamesWith(
      node,
      (node, container) => {
        if (typeof node === "string") {
          return { name: node, type: [] };
        }
        if (this.isGroupType(node)) return;
        if (isReference(node)) {
          const type = this.getNameStackItemType(node, container);
          return {
            name: node.$refText,
            type: [type]
          };
        }
        if (this.isNamedRefNode(node)) {
          return this.getNameStack(node.ref, node);
        }
        if (ast.isIdentifierNode(node)) {
          return this.getNameStack(ast.getIdentifierNodeName(node));
        }
        if (this.isNamed(node)) {
          const type = this.getNameStackItemType(node, container);
          const stack = this.getNameStack(node.name, node);
          if (stack) {
            const [last, ...prev] = stack;
            return [{ ...last, type: last.type ? [type, ...last.type] : [type] }, ...prev];
          }
          return [];
        }
        return this.getNameStack(super.getName(node));
      },
      container
    );
  }

  protected getNamesWith<T>(
    node: AstNode | Reference | string,
    warp: (name: AstNode | Reference | string, container?: AstNode) => T | T[],
    container?: AstNode
  ): T[] | undefined {
    if (!node) return [];
    let name: T | T[];
    if (isReference(node)) {
      name = warp(node, container);
    }
    // if (ast.isQualifiedName(node)) {
    //   return node.name.flatMap((name) => this.getNamesWith(name, warp, node) || []);
    // } else
    else {
      name = warp(node, isReference(node) && container);
    }
    return name ? (name instanceof Array ? name : [name]) : void 0;
  }

  private getNameWithStackItemType(type: NameStackItemType, refPrefix?: boolean): string;
  private getNameWithStackItemType(
    node: string | AstNode | Reference,
    container?: string | AstNode,
    refPrefix?: boolean
  ): string;
  private getNameWithStackItemType(
    node: NameStackItemType | string | AstNode | Reference,
    container?: string | AstNode | boolean,
    refPrefix?: boolean
  ) {
    const { source, target } = isNameStackItemType(node)
      ? node
      : this.getNameStackItemType(node, container as string | AstNode);
    return `(${
      (refPrefix || container) === true && source !== target ? target + "::" + source : source
    })`;
  }

  private getNameStackItemType(
    node: string | AstNode | Reference,
    container?: string | AstNode
  ): NameStackItemType {
    if (isReference(node)) node = (node.$refNode.feature as CrossReference).type.$refText;
    if (typeof node !== "string") node = node.$type;
    if (container && typeof container !== "string") container = container.$type;
    return { target: (container as string) || node, source: node };
  }

  /**
   * 是否为虚拟分组类型的节点
   * @param node
   */
  protected isGroupType(node: AstNode | Reference<AstNode>) {
    const type = isReference(node)
      ? (node.$refNode.feature as CrossReference).type.$refText
      : typeof node !== "string"
      ? node.$type
      : node;
    return this.reflection.isSubtype(type, ast.Declare);
  }

  isNamed(node: AstNode): node is ast.NamedNode {
    const { name } = node as any;
    return isReference(name) || ast.isIdentifierNode(name) || typeof name === "string";
  }

  isNamedWithIdentifier(node: AstNode): node is ast.IdentifierNamedNode {
    const { name } = node as any;
    return ast.isIdentifierNode(name);
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
  getQualifiedName(qualifier: AstNode | string, name: AstNode | string): string {
    const astNodes = this.getQualifiedNameStack(qualifier, name);
    if (astNodes.length) {
      let index = 0,
        result = this.getNameStackItemName(astNodes[0], true);
      while (++index < astNodes.length) {
        result += "." + this.getNameStackItemName(astNodes[index], true);
      }
      return result;
    }
  }

  /**
   * @param qualifier if the qualifier is a `string`, simple string concatenation is done: `qualifier.name`.
   *      if the qualifier is a `PackageDeclaration` fully qualified name is created: `package1.package2.name`.
   * @param name simple name
   * @returns qualified name separated by `.`
   */
  getQualifiedNameStack(qualifier: AstNode | string, name: AstNode | string) {
    // console.log(
    //   "getQualifiedNameStack",
    //   this._getQualifiedName(qualifier, name, (node) => node)
    // );
    let tree: Trie.Trie = this.nestRefs;
    const list = this._getQualifiedNamedNodeStack(qualifier, name, (node) => node);
    const result = [] as NameStackItem[];
    for (let i = list.length - 1; i > -1; i--) {
      const node = list[i];
      const types = node && this.getNameStack(node);
      if (types?.length > 0) {
        const searched = types[0];
        if (searched) {
          tree =
            tree && searched?.type?.map((o) => Trie.findNext(tree, o.source)).filter(Boolean)[0];
          if (result.length > 0 && !tree) {
            return result;
          }
          result.unshift(searched);
        }
      }
    }
    return result;
  }

  _getQualifiedNamedNodeStack<T>(
    qualifier: T | AstNode,
    name: T | AstNode,
    wrap: (node: T | AstNode) => T | AstNode
  ): (false | T | AstNode)[] {
    const result = [] as (false | T | AstNode)[];
    if (isAstNode(qualifier)) {
      do {
        while (this.isGroupType(qualifier)) {
          qualifier = qualifier.$container;
        }
        if (qualifier) {
          result.unshift(wrap(qualifier));
        }
      } while (qualifier && (qualifier = qualifier.$container));
    } else {
      result.unshift(wrap(qualifier));
    }
    if (!ast.isIdentifierNode(name)) {
      const next = wrap(name);
      result.push(next);
    }
    return result;
  }

  namedReferenceFeatures = toConstMap(["ref"]);
  getNameNode(node: AstNode) {
    if (ast.isAction(node)) {
      return node.$cstNode;
    }
    return (
      this.getIdentifierNameFeature(node) ||
      findNodeForFeature(node.$cstNode, "kind") ||
      findNodeForFeature(node.$cstNode, "name") ||
      Object.keys(this.namedReferenceFeatures)
        .map((key) => findNodeForFeature(node.$cstNode, key))
        .filter(Boolean)[0]
    );
  }
}

export interface NameStackItem {
  name: string;
  type?: NameStackItemType[];
}

export interface NameStackItemType {
  target: string;
  source: string;
}
function isNameStackItemType(o: any): o is NameStackItemType {
  return typeof o.target === "string" && typeof o.source === "string";
}
