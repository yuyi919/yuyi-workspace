import {
  AstNode,
  AstNodeDescription,
  DefaultAstNodeDescriptionProvider,
  interruptAndCheck,
  LangiumDocument,
  LangiumServices,
  MaybePromise,
  streamAllContents
} from "langium";
import { DefaultAstNodeLocator } from "langium/lib/index/ast-node-locator";
import { AstNodeHoverProvider } from "langium/lib/lsp/hover-provider";
import { CancellationToken, Hover } from "vscode-languageserver-protocol";
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
      let name: string = this.nameProvider.getName(modelNode);
      if (name) {
        name = this.nameProvider.getQualifiedName(modelNode.$container!, modelNode);
      }
      // console.log("createDescriptions", modelNode, name);
      if (name) {
        if (ast.isDialog(modelNode)) {
          modelNode.elements.forEach((el) => {
            const name = this.nameProvider.getQualifiedName(
              modelNode.ref.$refText,
              el.ref.$refText
            );
            descr.push(this.createDescription(modelNode, name, document));
          });
        }
        const desc = this.createDescription(modelNode, name, document);
        // console.log("createDescriptions", modelNode.$type, name, desc);
        descr.push(desc);
      }
    }
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
    return super.getAstNodePath(
      ast.isIdentifier(node) || ast.isNameIdentifier(node) ? node.$container : node
    );
  }
}
export class HoverProvider extends AstNodeHoverProvider {
  constructor(protected services: LangiumServices) {
    super(services);
  }
  
  protected getAstNodeHoverContent(node: AstNode): MaybePromise<Hover | undefined> {
    if (ast.isNameIdentifier(node)) {
      return {
        contents: [
          {
            language: "advscript",
            value: node.$container.$cstNode.text,
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
          ast.isCharacter(node.$container) && {
            language: "typescript",
            value: `(call) useCharacter("${node.text!}", {\n${node.$container.elements
              .map((p) => {
                if (ast.isParam(p)) {
                  return `  ${p.name.text}: ${JSON.stringify(p.value.$cstNode?.text)},`;
                }
                return;
              })
              .filter(Boolean)
              .flat(2)
              .join("\n")}\n})`,
          },
        ].filter(Boolean),
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
