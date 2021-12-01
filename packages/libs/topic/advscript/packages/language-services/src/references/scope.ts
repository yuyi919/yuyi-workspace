import {
  AstNode,
  AstNodeDescription,
  DefaultScopeComputation,
  DefaultScopeProvider,
  interruptAndCheck,
  LangiumDocument,
  PrecomputedScopes,
} from "langium";
import { CancellationToken } from "vscode-languageserver-protocol";
import { AdvscriptServices } from "../advscript-module";
import * as ast from "../ast";

export class AdvscriptScopeProvider extends DefaultScopeProvider {}

export class ScopeComputation extends DefaultScopeComputation {
  constructor(services: AdvscriptServices) {
    super(services);
  }
  declare nameProvider: AdvscriptServices["references"]["NameProvider"];

  async computeScope(
    document: LangiumDocument,
    cancelToken = CancellationToken.None
  ): Promise<PrecomputedScopes> {
    const model = document.parseResult.value as ast.Document;
    const scopes = new Map<AstNode, AstNodeDescription[]>();
    await this.processContainer(model, scopes, document, cancelToken);
    const next = await super.computeScope(document, cancelToken);
    // console.log(scopes);
    return scopes; //scopes;
  }

  protected async processContainer(
    container: ast.Document | ast.CharactersDeclare | ast.MacroDeclare,
    scopes: PrecomputedScopes,
    document: LangiumDocument,
    cancelToken: CancellationToken
  ): Promise<AstNodeDescription[]> {
    const localDescriptions: AstNodeDescription[] = [];
    for (const element of ast.isDocument(container)
      ? [
          // ...container.defines,
          ...container.contents,
        ]
      : container.elements) {
      interruptAndCheck(cancelToken);
      if (ast.isCharacter(element)) {
        const description = this.descriptions.createDescription(
          element,
          element.name.text,
          document
        );
        localDescriptions.push(description);
        const children: AstNodeDescription[] = [];
        element.modifiers.forEach((el) => {
          children.push(
            this.descriptions.createDescription(element, "modifiers." + el.name, document)
          );
        });
        scopes.set(element, children);
      } else if (ast.isMacro(element)) {
        const description = this.descriptions.createDescription(
          element,
          element.name.text,
          document
        );
        localDescriptions.push(description);
        const children: AstNodeDescription[] = [];
        element.elements.forEach((el) => {
          children.push(this.descriptions.createDescription(element, "macro." + el.name, document));
        });
        scopes.set(element, children);
      } else if (ast.isDialog(element)) {
        const description = this.descriptions.createDescription(
          element,
          element.ref?.$refText,
          document
        );
        localDescriptions.push(description);
        const children: AstNodeDescription[] = [];
        element.elements.forEach((el) => {
          children.push(this.descriptions.createDescription(element, el.ref.$refText, document));
        });
        scopes.set(element, children);
        // console.log("Dialog", element, children);
      } else if (this.nameProvider.isDeepPathedNode(element)) {
        const nestedDescriptions = await this.processContainer(
          element,
          scopes,
          document,
          cancelToken
        );
        for (const description of nestedDescriptions) {
          // Add qualified names to the container
          const qualified = this.createQualifiedDescription(element, description, document);
          localDescriptions.push(qualified);
        }
        // console.log("isCharactersDeclare", element.$type, nestedDescriptions, localDescriptions);
      }
    }
    scopes.set(container, localDescriptions);
    return localDescriptions;
  }

  protected createQualifiedDescription(
    pack: ast.Declare,
    description: AstNodeDescription,
    document: LangiumDocument
  ): AstNodeDescription {
    const name = this.nameProvider.getQualifiedName(pack, description.name);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.descriptions.createDescription(description.node!, name, document);
  }
}
