import {
  Action,
  Assignment,
  AstNode,
  AstNodeDescription,
  CstNode,
  DefaultAstNodeDescriptionProvider,
  findAssignment as findAssignment2,
  getContainerOfType,
  interruptAndCheck,
  isArray,
  isArrayOperator,
  isParserRule,
  LangiumDocument,
  LangiumServices,
  streamAllContents
} from "langium";
import { DefaultAstNodeLocator } from "langium/lib/workspace/ast-node-locator";
import { CancellationToken } from "vscode-languageserver-protocol";
import * as ast from "./ast-utils";
import * as Refenences from "./references";

export class AstNodeDescriptionProvider extends DefaultAstNodeDescriptionProvider {
  declare nameProvider: Refenences.NameProvider;
  constructor(services: LangiumServices) {
    super(services);
  }

  /**
   * Exports only types (`DataType` or `Entity`) with their qualified names.
   */
  async createDescriptions(
    document: LangiumDocument,
    cancelToken = CancellationToken.None
  ): Promise<AstNodeDescription[]> {
    const descr: AstNodeDescription[] = [];
    for (const modelNode of streamAllContents(document.parseResult.value)) {
      await interruptAndCheck(cancelToken);
      // if (ast.isIdentifierNode(modelNode)) continue;
      const name: string = this.nameProvider.getQualifiedName(modelNode.$container!, modelNode);
      // console.log("createDescriptions", modelNode, name);
      if (name) {
        const desc = this.createDescription(modelNode, name, document);
        // console.log("createDescriptions", modelNode.$type, name, desc);
        Object.assign(desc, { plainName: this.nameProvider.getPlainName(modelNode) });
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
export function findAssignment(cstNode: CstNode): Assignment | Action | undefined {
  const parser = getContainerOfType(cstNode.feature, isParserRule);
  // console.log(cstNode.feature, parser, Array.from(findAllFeatures(parser)))
  return undefined;
}
export class AstNodeLocator extends DefaultAstNodeLocator {
  getAstNodePath(node: AstNode) {
    return super.getAstNodePath(ast.isIdentifierNode(node) ? node.$container : node);
  }
  pathSegment(node: AstNode, container: AstNode): string {
    if (node.$cstNode) {
      const assignment = findAssignment2(node.$cstNode);
      // if (isVariable(node)) {
      //   console.log("findAssignment(node.$cstNode)", assignment, node);
      // }
      if (assignment) {
        if (isArray(assignment.cardinality) || isArrayOperator(assignment.operator)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const value = (container as any)[assignment.feature] as AstNode[];
          const idx = value.indexOf(node);
          return assignment.feature + "@" + idx;
        }
        return assignment.feature;
      }
    }
    return "<missing>";
  }
}
