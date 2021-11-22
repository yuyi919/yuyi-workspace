/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import {
  AstNode,
  AstNodeDescription,
  DefaultScopeComputation,
  interruptAndCheck,
  LangiumDocument,
  LangiumServices,
  PrecomputedScopes,
} from "langium";
import { CancellationToken } from "vscode-languageserver-protocol";
import { AdvscriptModelNameProvider } from "./advscript-provider";
import {
  CharactersDeclare,
  Declare,
  Document,
  isCharacter,
  isDialog,
  isDocument,
  isMacro,
  MacroDeclare,
} from "./generated/ast";

export class ScopeComputation extends DefaultScopeComputation {
  constructor(services: LangiumServices) {
    super(services);
  }
  declare nameProvider: AdvscriptModelNameProvider;

  async computeScope(
    document: LangiumDocument,
    cancelToken = CancellationToken.None
  ): Promise<PrecomputedScopes> {
    const model = document.parseResult.value as Document;
    const scopes = new Map<AstNode, AstNodeDescription[]>();
    await this.processContainer(model, scopes, document, cancelToken);
    const next = await super.computeScope(document, cancelToken);
    // console.log(scopes);
    return scopes; //scopes;
  }

  protected async processContainer(
    container: Document | CharactersDeclare | MacroDeclare,
    scopes: PrecomputedScopes,
    document: LangiumDocument,
    cancelToken: CancellationToken
  ): Promise<AstNodeDescription[]> {
    const localDescriptions: AstNodeDescription[] = [];
    for (const element of isDocument(container)
      ? [...container.defines, ...container.contents]
      : container.elements) {
      interruptAndCheck(cancelToken);
      if (isCharacter(element)) {
        const description = this.descriptions.createDescription(element, element.name, document);
        localDescriptions.push(description);
        const children: AstNodeDescription[] = [];
        element.modifiers.forEach((el) => {
          children.push(
            this.descriptions.createDescription(element, "modifiers." + el.name, document)
          );
        });
        scopes.set(element, children);
      } else if (isMacro(element)) {
        const description = this.descriptions.createDescription(element, element.name, document);
        localDescriptions.push(description);
        const children: AstNodeDescription[] = [];
        element.elements.forEach((el) => {
          children.push(this.descriptions.createDescription(element, "macro." + el.name, document));
        });
        scopes.set(element, children);
      } else if (isDialog(element)) {
        const description = this.descriptions.createDescription(
          element,
          element.ref?.$refText,
          document
        );
        localDescriptions.push(description);
        const children: AstNodeDescription[] = [];
        element.elements.forEach((el) => {
          children.push(this.descriptions.createDescription(element, el.$refText, document));
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
    pack: Declare,
    description: AstNodeDescription,
    document: LangiumDocument
  ): AstNodeDescription {
    const name = this.nameProvider.getQualifiedName(pack, description.name);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.descriptions.createDescription(description.node!, name, document);
  }
}
