import { AstNode, LangiumServices, MaybePromise } from "langium";
import { AstNodeHoverProvider } from "langium/lib/lsp/hover-provider";
import { Hover } from "vscode-languageserver-protocol";
import * as ast from "../ast-utils";

export class HoverProvider extends AstNodeHoverProvider {
  constructor(protected services: LangiumServices) {
    super(services);
  }

  protected getAstNodeHoverContent(node: AstNode): MaybePromise<Hover | undefined> {
    if (ast.isIdentifierNode(node)) {
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
