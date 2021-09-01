import ts from "typescript";
import { extractComment, markBarTokenWithTypeNode } from "..";
import * as definition from "../../definition-collection";
import { createMacroFunctionResolver } from "../../macro-resolver";
import { transformSpec } from "../../test-utils";

describe("test", () => {
  it("testResolve", () => {
    const result = transformSpec(
      (node, context) => {
        const { tsInstance } = context;
        const resolver = createMacroFunctionResolver(
          require.resolve("./testFunction"),
          "CREATE",
          context
        );
        // if (resolver.isImportOrExport(node)) {
        //   return resolver.cleanImportOrExport(node);
        // }
        if (tsInstance.isTypeAliasDeclaration(node) && tsInstance.isUnionTypeNode(node.type)) {
          const types = definition.Type.getBaseType(node.type);
          if (
            types instanceof Array &&
            (types.every((o) => o.name === "literal" && o.type === "number") ||
              types.every((o) => o.name === "literal" && o.type === "string"))
          ) {
            types.forEach((member) => {
              const barTokenNode = markBarTokenWithTypeNode(member.node);
              const { comments, tags } = extractComment(barTokenNode, node.getSourceFile());
              expect({ comments, tags }).toMatchSnapshot();
            });
          }
          return node;
        }
        if (resolver.isCallExpression(node)) {
          const name = node.getText();
          console.log(name, "isRefedCallExpression");
          return ts.factory.createObjectLiteralExpression([]);
        }
      },
      require.resolve("./index"),
      {
        compilerOptions: {
          target: ts.ScriptTarget.ESNext,
          module: ts.ModuleKind.ESNext,
        },
      }
    );
    expect(result).toMatchSnapshot();
  });
});
