import {
  AstNode,
  AstNodeDescription,
  DefaultAstNodeDescriptionProvider,
  DefaultLinker,
  DefaultNameProvider,
  DefaultScopeProvider,
  findNodeForFeature,
  getReferenceProperty,
  interruptAndCheck,
  isCrossReference,
  isNamed,
  isReference,
  LangiumDocument,
  LangiumServices,
  LinkingError,
  MaybePromise,
  Reference,
  ReferenceInfo,
  streamAllContents,
} from "langium";
import { AstNodeHoverProvider } from "langium/lib/lsp/hover-provider";
import { CancellationToken, Hover } from "vscode-languageserver-protocol";
import { AdvscriptServices } from "./advscript-module";
import {
  AdvscriptAstReference,
  AdvscriptAstReflection,
  Character,
  CharactersDeclare,
  Identifier,
  isCharacter,
  isCharactersDeclare,
  isDialog,
  isIdentifier,
  isMacro,
  isMacroDeclare,
  isModifier,
  isNamedArg,
  isQualifiedName,
  Macro,
  MacroDeclare,
  Modifier,
  Param,
} from "./generated/ast";

export class AstNodeDescriptionProvider extends DefaultAstNodeDescriptionProvider {
  declare nameProvider: AdvscriptModelNameProvider;
  constructor(services: LangiumServices) {
    super(services);
  }

  /**
   * Exports only types (`DataType or `Entity`) with their qualified names.
   */
  async createDescriptions(
    document: LangiumDocument,
    cancelToken = CancellationToken.None
  ): Promise<AstNodeDescription[]> {
    const descr: AstNodeDescription[] = [];
    for (const content of streamAllContents(document.parseResult.value)) {
      await interruptAndCheck(cancelToken);
      const modelNode = content.node;
      let name = this.nameProvider.getName(modelNode);
      if (name) {
        if (isNamed(modelNode)) {
          name = this.nameProvider.getQualifiedName(modelNode.$container!, modelNode.name);
        }
        if (isDialog(modelNode)) {
          modelNode.elements.forEach((el) => {
            const name = this.nameProvider.getQualifiedName(modelNode.ref.$refText, el.$refText);
            descr.push(this.createDescription(modelNode, name, document));
          });
        }
        // console.log("createDescriptions", modelNode.$type, name);
        descr.push(this.createDescription(modelNode, name, document));
      }
    }
    return descr;
  }
}
//  export function toQualifiedName(pack: CharacterDefine, childName: string): string {
//      return (isPackageDeclaration(pack.$container) ? toQualifiedName(pack.$container, pack.name) : pack.name) + '.' + childName;
//  }

function createNodeName(...nodes: (string | AstNode | Reference)[]) {
  return nodes
    .map((o) => {
      if (typeof o === "string") return o;
      if (isReference(o)) {
        return isCrossReference(o.$refNode.feature)
          ? `($${o.$refNode.feature.type.$refText})${o.$refText}`
          : `($ref)${o.$refText}`;
      }
      return isNamed(o) && typeof o.name === "string" ? `(${o.$type})${o.name}` : `(${o.$type})`;
    })
    .join(".");
}
export class AdvscriptModelNameProvider extends DefaultNameProvider {
  reflection: AdvscriptAstReflection;
  constructor(private services: AdvscriptServices) {
    super();
    this.reflection = services.AstReflection;
  }

  getReferenceNodeName(
    refId: AdvscriptAstReference | ({} & string),
    reference: Reference,
    container: AstNode
  ) {
    const refType = this.reflection.getReferenceType(refId as AdvscriptAstReference);
    let type: string = "";
    if (isDialog(container) && refType === Modifier) {
      type = container.ref.$refText;
    }
    if (isNamedArg(container) && refType === Param) {
      type = container.$container.ref.$refText;
    }
    if (isQualifiedName(container)) {
      type = container.name
        .slice(0, container.name.indexOf(reference as Reference<Identifier>))
        .map((name) => name.$refText)
        .join(".");
    }
    // console.log("getReferenceNodeName: " + refType + "=>" + type, reference.$refText);
    return type ? `${type}.${reference.$refText}` : `${reference.$refText}`;
  }

  isNamedRefNode(node: unknown): node is AstNode & { ref: Reference<AstNode> } {
    return isReference((node as any).ref);
  }

  getName(node: AstNode): string | undefined {
    if (this.isNamedRefNode(node) && node.ref.$refText) {
      return `(${node.$type})` + node.ref.$refText;
    }
    if (isQualifiedName(node)) {
      return node.name.map((name) => name.$refText).join(".");
    }
    if (isNamed(node)) {
      if (isReference(node.name)) {
        return node.name.$refText; // return createNodeName(node.$container, node.name);
      }
      if (isIdentifier(node.name)) {
        return node.name.name;
      }
      return super.getName(node);
    }
    if (typeof node === "string") {
      return node;
    }
    return super.getName(node);
  }

  getNameNode(node: AstNode) {
    return (
      findNodeForFeature(node.$cstNode, "name") ||
      findNodeForFeature(node.$cstNode, "ref") ||
      findNodeForFeature(node.$cstNode, "kind")
    );
  }

  /**
   * @param qualifier if the qualifier is a `string`, simple string concatenation is done: `qualifier.name`.
   *      if the qualifier is a `PackageDeclaration` fully qualified name is created: `package1.package2.name`.
   * @param name simple name
   * @returns qualified name separated by `.`
   */
  getQualifiedName(
    qualifier: Character | Modifier | Macro | AstNode | string,
    name: string
  ): string {
    let prefix = qualifier;
    if (this.isDeepElementNode(qualifier)) {
      prefix = this.isDeepPathedNode(qualifier.$container)
        ? this.getQualifiedName(qualifier.$container, this.getName(qualifier)!)
        : this.getName(qualifier)!;
    }
    return (typeof prefix === "string" ? prefix + "." : "") + name;
  }

  isDeepPathedNode(target: AstNode): target is CharactersDeclare | MacroDeclare {
    return isCharactersDeclare(target) || isMacroDeclare(target);
  }
  isDeepElementNode(target: AstNode | string): target is Character | Modifier | Macro {
    return isCharacter(target) || isModifier(target) || isMacro(target);
  }
}
export class Linker extends DefaultLinker {
  protected readonly reflection: AdvscriptAstReflection;
  constructor(
    services: LangiumServices,
    private nameProvider = services.references.NameProvider as AdvscriptModelNameProvider
  ) {
    super(services);
    this.reflection = services.AstReflection;
  }

  getCandidate(
    container: AstNode,
    refId: string,
    reference: Reference
  ): AstNodeDescription | LinkingError {
    const description = this.getDescription(container, refId, reference);
    return (
      description ??
      this.createLinkingError({
        container,
        property: getReferenceProperty(refId),
        reference,
      })
    );
  }

  protected doLink(info: ReferenceInfo, document: LangiumDocument): void {
    super.doLink(info, document);
    const error = info.reference.error;
    if (error) {
      // console.log(error, info)
      error.index = info.index; // NOTE 修复索引不正确赋值
    }
  }

  getDescription(container: AstNode, refId: string, reference: Reference) {
    const scope = this.scopeProvider.getScope(container, refId);
    const queryName = this.nameProvider.getReferenceNodeName(refId, reference, container);
    const description = scope.getElement(queryName);
    // console.log(
    //   `getDescription：${refId} => ${this.reflection.getReferenceType(refId as any)}`,
    //   [...scope.getAllElements()],
    //   queryName
    // );
    return description;
  }
}
export class AdvscriptScopeProvider extends DefaultScopeProvider {}

export class HoverProvider extends AstNodeHoverProvider {
  protected getAstNodeHoverContent(node: AstNode): MaybePromise<Hover | undefined> {
    if (isCharacter(node)) {
      return {
        contents: {
          language: "markdown",
          value: node.$cstNode.text,
          // `(call) callCharacter("${node.name!}", {\n${node.elements
          //   .map((p) => {
          //     if (isParam(p)) {
          //       return `  ${p.name}: ${JSON.stringify(p.value.$cstNode?.text)},`;
          //     }
          //     return;
          //   })
          //   .filter(Boolean)
          //   .flat(2)
          //   .join("\n")}\n})`,
        },
      };
    }
    return {
      contents: {
        language: "typescript",
        value: `type ${node.$type}`,
      },
    };
  }
}