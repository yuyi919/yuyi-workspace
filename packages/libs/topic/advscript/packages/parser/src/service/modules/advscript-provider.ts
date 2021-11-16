import {
  AstNode,
  AstNodeDescription,
  DefaultAstNodeDescriptionProvider,
  DefaultLinker,
  DefaultNameProvider,
  DefaultScopeProvider,
  getReferenceProperty,
  interruptAndCheck,
  LangiumDocument,
  LangiumServices,
  LinkingError,
  MaybePromise,
  Reference,
  streamAllContents,
} from "langium";
import { AstNodeHoverProvider } from "langium/lib/lsp/hover-provider";
import { CancellationToken } from "vscode-languageserver";
import { Hover } from "vscode-languageserver-protocol";
import { AdvscriptServices } from "./advscript-module";
import {
  AdvscriptAstReference,
  AdvscriptAstReflection,
  Character,
  CharacterDefine,
  isCharacter,
  isCharacterDefine,
  isDialog,
  isTemplate,
} from "./generated/ast";

export class DomainModelDescriptionProvider extends DefaultAstNodeDescriptionProvider {
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
        if (isCharacterDefine(modelNode.$container)) {
          name = (this.nameProvider as DomainModelNameProvider).getQualifiedName(
            modelNode.$container,
            name
          );
          descr.push(this.createDescription(modelNode, name, document));
        }
      }
    }
    return descr;
  }
}
//  export function toQualifiedName(pack: CharacterDefine, childName: string): string {
//      return (isPackageDeclaration(pack.$container) ? toQualifiedName(pack.$container, pack.name) : pack.name) + '.' + childName;
//  }

export class DomainModelNameProvider extends DefaultNameProvider {
  constructor(private services: AdvscriptServices) {
    super();
  }

  getName(node: AstNode): string | undefined {
    if ((isDialog(node) || isTemplate(node)) && node.name.$refText) {
      return "Characters." + node.name.$refText;
    }
    return super.getName(node);
  }

  getNameNode(node: AstNode) {
    return super.getNameNode(node);
  }

  /**
   * @param qualifier if the qualifier is a `string`, simple string concatenation is done: `qualifier.name`.
   *      if the qualifier is a `PackageDeclaration` fully qualified name is created: `package1.package2.name`.
   * @param name simple name
   * @returns qualified name separated by `.`
   */
  getQualifiedName(qualifier: Character | CharacterDefine | string, name: string): string {
    let prefix = qualifier;
    if (isCharacter(qualifier) || isCharacterDefine(qualifier)) {
      prefix = isCharacterDefine(qualifier.$container)
        ? this.getQualifiedName(qualifier.$container, qualifier.name)
        : qualifier.name;
    }
    return (prefix ? prefix + "." : "") + name;
  }
}
export class Linker extends DefaultLinker {
  protected readonly reflection: AdvscriptAstReflection;
  constructor(services: LangiumServices) {
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

  getDescription(container: AstNode, refId: string, reference: Reference) {
    const scope = this.scopeProvider.getScope(container, refId);
    const description =
      this.reflection.getReferenceType(refId as AdvscriptAstReference) === Character
        ? scope.getElement("Characters." + reference.$refText)
        : scope.getElement(reference.$refText);
    return description;
  }
}
export class AdvscriptScopeProvider extends DefaultScopeProvider {}

export class HoverProvider extends AstNodeHoverProvider {
  protected getAstNodeHoverContent(node: AstNode): MaybePromise<Hover | undefined> {
    if (isCharacter(node)) {
      return {
        contents: {
          language: "typescript",
          value: `callCharacter("${node.name!}", {\n${node.params
            .map((p) => `  ${p.key}: ${JSON.stringify(p.value.value)},`)
            .join("\n")}\n}`,
        },
      };
    }
    return {
      contents: {
        language: "typescript",
        value: node.$type,
      },
    };
  }
}
