import {
  AstNode,
  AstNodeDescription,
  CompositeCstNode,
  CstNode,
  DefaultLinker,
  getDocument,
  getReferenceId,
  getReferenceProperty,
  LangiumDocument,
  LinkingError,
  Reference,
  ReferenceInfo,
  streamReferences,
  streamAllContents,
  interruptAndCheck,
} from "langium";
import { memoize } from "lodash";
import { AdvScriptServices } from "../advscript-module";
import * as ast from "../ast-utils";
import { NameProvider } from "./nameing";
import { ScopeProvider } from "./scope";
import { relative } from "path";
import * as sort from "./sort";
import { CancellationToken } from "vscode-languageserver-protocol";

export class Linker extends DefaultLinker {
  protected declare readonly scopeProvider: ScopeProvider;
  protected readonly reflection: ast.AdvScriptAstReflection;
  protected readonly nameProvider: NameProvider;
  constructor(protected services: AdvScriptServices) {
    super(services);
    this.reflection = services.shared.AstReflection;
    this.nameProvider = services.references.NameProvider;
  }

  getCandidateWithCache(cstNode: CstNode): AstNodeDescription | LinkingError {
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
        }, refId)
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

  async link(document: LangiumDocument, cancelToken = CancellationToken.None): Promise<void> {
    const process = (node: AstNode) => {
      for (const ref of streamReferences(node)) {
        this.doLink(ref, document);
      }
    };
    const rootNode = document.parseResult.value;
    process(rootNode);
    await interruptAndCheck(cancelToken)
    for (const content of streamAllContents(rootNode)) {
      process(content.node)
    }
  }

  protected doLink(info: ReferenceInfo, document: LangiumDocument): void {
    super.doLink(info, document);
    const error = info.reference.error;
    if (error) {
      const { container, property, reference, index } = info;
      const refId = getReferenceId(container.$type, property) as ast.AdvScriptAstReference;
      error.message = `[scope] (${container.$type}:${this.reflection.getReferenceType(
        refId
      )})${this.nameProvider.getReferenceNodeName(refId, reference, container)} is not defined`;
      error.index = index; // NOTE 修复索引不正确赋值
    }
  }

  getDescription(container: AstNode, refId: string, reference: Reference) {
    const scope = this.scopeProvider.getScope(container, refId);
    const queryName = this.nameProvider.getReferenceNodeName(refId, reference, container);
    // console.log("getDescription", queryName, container, refId, reference.$refText);
    const docUri = getDocument(container).uri.toString();
    const currentOffset = container.$cstNode?.offset;
    if (docUri && isNotNaN(currentOffset)) {
      // console.time("getDescription");
      const description = scope.filterElementWith((desc) => {
        // if (desc.name === queryName) {
        //     const target = this.astNodeLocator.getAstNode(
        //       this.langiumDocuments().getOrCreateDocument(desc.documentUri),
        //       desc.path
        //     );
        //     if (target.$cstNode.offset < container.$cstNode.offset) {
        //       console.log(desc);
        //       return desc; //&& desc.no
        //     }
        //   return true;
        // }
        return desc.name === queryName;
      });
      const descList = description.toArray();
      const result = this.sortDescriptionList(descList, container)[0];
      // console.timeEnd("getDescription");
      return result;
    }
    return scope.getElement(queryName);
  }

  /**
   * 对结果进行排序，同一个文档的优先，其次定义在当前节点前的优先(根据offset)，然后从中优先最近的一个节点(先判断行最近，然后判断列最远)
   * @param descList
   * @param node
   */
  private sortDescriptionList(descList: AstNodeDescription[], node: AstNode) {
    const currentOffset = node.$cstNode?.offset;
    const docUri = getDocument(node).uri.toString();
    return descList.sort((a, b) => {
      const aUri = a.documentUri.toString();
      const bUri = b.documentUri.toString();
      const sortLocal = sort.compareWithConst(aUri, bUri, docUri);
      if (sortLocal === true) {
        const document = this.langiumDocuments().getOrCreateDocument(a.documentUri);
        const aNode = this.astNodeLocator.getAstNode(document, a.path);
        const bNode = this.astNodeLocator.getAstNode(document, b.path);
        const sortWithNode = sort.compareWithObjectNotNil(aNode, bNode);
        if (sortWithNode === true) {
          const aoffset = aNode!.$cstNode?.end,
            boffset = bNode!.$cstNode?.end;
          if (aoffset === boffset) return 0;
          const isNotNaNSort = sort.compareWithLogic(aoffset, boffset, isNotNaN);
          if (isNotNaNSort === true) {
            const sortBefore = sort.compareWithLogic(
              aoffset,
              boffset,
              (offset) => offset! < currentOffset!
            );
            if (sortBefore === true) {
              const aStart = aNode!.$cstNode!.range.start,
                bStart = bNode!.$cstNode!.range.start;
              const lineDiff = sort.compareWithNumber(aStart.line, bStart.line);
              return lineDiff === 0
                ? sort.compareWithNumber(bStart.character, aStart.character)
                : lineDiff;
            }
            return sortBefore;
          }
          return isNotNaNSort;
        }
        return sortWithNode;
      } else if (sortLocal === 0) {
        return sort.compareWithRelativePath(aUri, bUri, docUri);
      }
      return sortLocal;
    });
  }
}
function isNotNaN(target: unknown): target is number {
  return typeof target === "number" && !isNaN(target);
}
