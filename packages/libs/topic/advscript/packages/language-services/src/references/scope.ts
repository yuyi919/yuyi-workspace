import {
  AstNode,
  AstNodeDescription,
  DefaultScopeComputation,
  DefaultScopeProvider,
  interruptAndCheck,
  LangiumDocument,
  PrecomputedScopes,
  Stream,
  Scope,
  getDocument,
  stream,
  MultiMap,
} from "langium";
import { CancellationToken } from "vscode-languageserver-protocol";
import { AdvScriptServices } from "../advscript-module";
import * as ast from "../ast-utils";

export class ScopeProvider extends DefaultScopeProvider {
  getScope(node: AstNode, referenceId: string) {
    const scopes: Array<Stream<AstNodeDescription>> = [];
    const referenceType = this.reflection.getReferenceType(referenceId);

    const precomputed = getDocument(node).precomputedScopes;
    if (precomputed) {
      let currentNode: AstNode | undefined = node;
      do {
        const allDescriptions = precomputed.get(currentNode);
        if (allDescriptions) {
          scopes.push(
            stream(allDescriptions).filter((desc) =>
              this.reflection.isSubtype(desc.type, referenceType)
            )
          );
        }
        currentNode = currentNode.$container;
      } while (currentNode);
    }

    let result: SimpleScope = this.getGlobalScope(referenceType);
    for (let i = scopes.length - 1; i >= 0; i--) {
      result = new SimpleScope(scopes[i], result);
    }
    return result;
  }

  protected getGlobalScope(nodeType: string) {
    return new SimpleScope(this.indexManager.allElements(nodeType));
  }
}

export class SimpleScope implements Scope {
  readonly elements: Stream<AstNodeDescription>;
  readonly outerScope?: SimpleScope;

  constructor(elements: Stream<AstNodeDescription>, outerScope?: SimpleScope) {
    this.elements = elements;
    this.outerScope = outerScope;
  }

  getAllElements(): Stream<AstNodeDescription> {
    if (this.outerScope) {
      return this.elements.concat(this.outerScope.getAllElements());
    } else {
      return this.elements;
    }
  }

  getElement(name: string): AstNodeDescription | undefined {
    const local = this.elements.find((e) => e.name === name);
    if (local) {
      return local;
    }
    if (this.outerScope) {
      return this.outerScope.getElement(name);
    }
    return undefined;
  }

  filterElementWith(walker: (e: AstNodeDescription) => any): Stream<AstNodeDescription> {
    const local = this.elements.filter(walker);
    if (this.outerScope) {
      return local
        ? local.concat(this.outerScope.filterElementWith(walker))
        : this.outerScope.filterElementWith(walker);
    }
    return local;
  }
}

export class ScopeComputation extends DefaultScopeComputation {
  constructor(services: AdvScriptServices) {
    super(services);
  }
  declare nameProvider: AdvScriptServices["references"]["NameProvider"];

  async computeScope(
    document: LangiumDocument,
    cancelToken = CancellationToken.None
  ): Promise<PrecomputedScopes> {
    const model = document.parseResult.value as ast.Document;
    const scopes = new MultiMap<AstNode, AstNodeDescription>();
    await this.processContainer(model, scopes, document, cancelToken);
    const next = await super.computeScope(document, cancelToken);
    // console.log(scopes);
    return next; //scopes;
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
          ...container.content.contents,
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
        element.modifiers.elements.forEach((el) => {
          children.push(
            this.descriptions.createDescription(element, "modifiers." + el.name, document)
          );
        });
        scopes.addAll(element, children);
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
        scopes.addAll(element, children);
      } else if (ast.isDialog(element)) {
        const description = this.descriptions.createDescription(
          element,
          element.ref?.$refText,
          document
        );
        localDescriptions.push(description);
        const children: AstNodeDescription[] = [];
        element.elements.forEach((el) => {
          if (ast.isCallMacro(el) || ast.isModifierRef(el)) {
            children.push(this.descriptions.createDescription(element, el.ref.$refText, document));
          }
        });
        scopes.addAll(element, children);
        // console.log("Dialog", element, children);
      } 
      // else if (this.nameProvider.isContainerNode(element)) {
      //   const nestedDescriptions = await this.processContainer(
      //     element,
      //     scopes,
      //     document,
      //     cancelToken
      //   );
      //   for (const description of nestedDescriptions) {
      //     // Add qualified names to the container
      //     const qualified = this.createQualifiedDescription(element, description, document);
      //     localDescriptions.push(qualified);
      //   }
      //   // console.log("isCharactersDeclare", element.$type, nestedDescriptions, localDescriptions);
      // }
    }
    scopes.addAll(container, localDescriptions);
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
