import {
  AstNode,
  AstNodeDescription,
  CompositeCstNode,
  DefaultLinker,
  getReferenceId,
  getReferenceProperty,
  LangiumDocument,
  LinkingError,
  Reference,
  ReferenceInfo,
} from "langium";
import { memoize } from "lodash";
import { AdvscriptServices } from "../advscript-module";
import * as ast from "../ast";
import { NameProvider } from "./nameing";

export class Linker extends DefaultLinker {
  protected readonly reflection: ast.AdvscriptAstReflection;
  protected readonly nameProvider: NameProvider;
  constructor(protected services: AdvscriptServices) {
    super(services);
    this.reflection = services.AstReflection;
    this.nameProvider = services.references.NameProvider;
  }

  getCandidateWithCache(cstNode: CompositeCstNode): AstNodeDescription | LinkingError {
    return this.getCandidate.cache.get(cstNode);
  }

  cleanCache() {
    return this.getCandidate.cache.clear();
  }

  getCandidate = memoize(
    (
      container: AstNode,
      refId: string,
      reference: Reference
    ): AstNodeDescription | LinkingError => {
      const description = this.getDescription(container, refId, reference);
      // console.log("getCandidate", this.getCandidate.cache);
      return (
        description ??
        this.createLinkingError({
          container,
          property: getReferenceProperty(refId),
          reference,
        })
      );
    },
    (_, _2, ref) => ref.$refNode
  );

  protected getLinkedNode(
    container: AstNode,
    refId: string,
    reference: Reference
  ): AstNode | LinkingError {
    return super.getLinkedNode(container, refId, reference);
  }

  protected doLink(info: ReferenceInfo, document: LangiumDocument): void {
    super.doLink(info, document);
    // console.log("doLink", info)
    const error = info.reference.error;
    if (error) {
      const { container, property, reference, index } = info;
      const refId = getReferenceId(container.$type, property) as ast.AdvscriptAstReference;
      error.message = `[scope] (${container.$type}:${this.reflection.getReferenceType(
        refId
      )})${this.nameProvider.getReferenceNodeName(refId, reference, container)} is not defined`;
      error.index = index; // NOTE 修复索引不正确赋值
    }
  }

  getDescription(container: AstNode, refId: string, reference: Reference) {
    const scope = this.scopeProvider.getScope(container, refId);
    const queryName = this.nameProvider.getReferenceNodeName(refId, reference, container);
    const description = scope.getElement(queryName);
    // console.log(
    //   `getDescription：${refId} => ${this.reflection.getReferenceType(refId as any)}`,
    //   description,
    //   queryName
    // );
    return description;
  }
}
