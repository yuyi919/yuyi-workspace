import {
  AstNode,
  AstNodeDescription,
  DefaultAstNodeDescriptionProvider,
  flatten,
  interruptAndCheck,
  LangiumDocument,
  LangiumServices,
  streamAllContents,
} from "langium";
import { DefaultAstNodeLocator } from "langium/lib/index/ast-node-locator";
import {
  CancellationToken,
} from "vscode-languageserver-protocol";
import * as ast from "./ast";
import * as Refenences from "./references";

export class AstNodeDescriptionProvider extends DefaultAstNodeDescriptionProvider {
  declare nameProvider: Refenences.NameProvider;
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
      // if (ast.isIdentifierNode(modelNode)) continue;
      const name: string = this.nameProvider.getQualifiedName(modelNode.$container!, modelNode);
      // console.log("createDescriptions", modelNode, name);
      if (name) {
        const desc = this.createDescription(modelNode, name, document);
        // console.log("createDescriptions", modelNode.$type, name, desc);
        descr.push(desc);
      }
    }
    // console.log(descr);
    return descr;
  }
}

//  export function toQualifiedName(pack: CharacterDefine, childName: string): string {
//      return (isPackageDeclaration(pack.$container) ? toQualifiedName(pack.$container, pack.name) : pack.name) + '.' + childName;
//  }

// function createNodeName(...nodes: (string | AstNode | Reference)[]) {
//   return nodes
//     .map((o) => {
//       if (typeof o === "string") return o;
//       if (isReference(o)) {
//         return isCrossReference(o.$refNode.feature)
//           ? `($${o.$refNode.feature.type.$refText})${o.$refText}`
//           : `($ref)${o.$refText}`;
//       }
//       return isNamed(o) && typeof o.name === "string" ? `(${o.$type})${o.name}` : `(${o.$type})`;
//     })
//     .join(".");
// }
export class AstNodeLocator extends DefaultAstNodeLocator {
  getAstNodePath(node: AstNode) {
    return super.getAstNodePath(ast.isNameIdentifier(node) ? node.$container : node);
  }
}


