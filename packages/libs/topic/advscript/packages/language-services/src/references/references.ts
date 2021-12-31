import {
  AstNode,
  AstNodeDescription,
  CompositeCstNode,
  CstNode,
  DefaultAstNodeDescriptionProvider,
  DefaultLinker,
  DefaultNameProvider,
  DefaultScopeProvider,
  findAssignment,
  findNodeForFeature,
  findRelevantNode,
  getReferenceId,
  getReferenceProperty,
  interruptAndCheck,
  isReference,
  LangiumDocument,
  LangiumServices,
  LinkingError,
  MaybePromise,
  Reference,
  ReferenceDescription,
  ReferenceInfo,
  Stream,
  streamAllContents,
} from "langium";
import { DefaultAstNodeLocator } from "langium/lib/workspace/ast-node-locator";
import { AstNodeHoverProvider } from "langium/lib/lsp/hover-provider";
import { DefaultReferences } from "langium/lib/references/references";
import { memoize } from "lodash";
import { CancellationToken, Hover, HoverParams } from "vscode-languageserver-protocol";
import { AdvScriptServices } from "../advscript-module";
import * as ast from "../ast-utils";
import { findWordNodeAtOffset } from "../_utils";
import { NameProvider } from "./nameing";

export class References extends DefaultReferences {
  declare nameProvider: NameProvider;
  findDeclaration(sourceCstNode: CstNode): CstNode | undefined {
    if (sourceCstNode) {
      const assignment = findAssignment(sourceCstNode);
      const nodeElem = findRelevantNode(sourceCstNode);
      // if (ast.isIdentifier(nodeElem) || ast.isNameIdentifier(nodeElem)) {
      //   nodeElem = nodeElem.$container;
      // }
      if (assignment && nodeElem) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reference = (nodeElem as any)[assignment.feature] as unknown;
        if (isReference(reference)) {
          return this.processReference(reference);
        } else if (Array.isArray(reference)) {
          for (const ref of reference) {
            if (isReference(ref)) {
              const target = this.processReference(ref);
              if (target) {
                // console.log("findDeclaration", target, sourceCstNode);
                return target;
              }
            }
          }
        } else {
          const nameNode = this.nameProvider.getNameNode(nodeElem);
          if (
            nameNode === sourceCstNode ||
            (nameNode &&
              nameNode.offset <= sourceCstNode.offset &&
              nameNode.offset + nameNode.length > sourceCstNode.offset)
          ) {
            // console.log("findDeclaration", nameNode);
            return nameNode;
          }
        }
      }
    }
    return undefined;
  }
  protected processReference(reference: Reference): CstNode | undefined {
    const ref = reference.ref;
    if (ref && ref.$cstNode) {
      const targetNode = this.nameProvider.getNameNode(ref);
      if (!targetNode) {
        return ref.$cstNode;
      } else {
        // console.log(targetNode, reference)
        return targetNode;
      }
    }
    return undefined;
  }
  // findReferences(targetNode: AstNode): Stream<ReferenceDescription> {
  //   const path = this.nodeLocator.getAstNodePath(targetNode);
  //   return ast.isIdentifier(targetNode) || ast.isNameIdentifier(targetNode)
  //     ? this.index.findAllReferences(targetNode, path.replace(/\/name$/, ""))
  //     : this.index.findAllReferences(targetNode, path); //"/header/defines@0/elements@2/name");
  // }
}
