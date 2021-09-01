import ts from "typescript";
import { createMacroFunctionResolver } from "..";
import { CustomTransformerHook } from "../../factory";
import { transformSpec } from "../../test-utils";

describe("test", () => {
  const transformer: CustomTransformerHook<any> = (node, context) => {
    const resolver = createMacroFunctionResolver(
      require.resolve("./importSource"),
      "CREATE",
      context
    );
    if (resolver.isImportOrExport(node)) {
      return resolver.cleanImportOrExport(node);
    }
    if (resolver.isCallExpression(node)) {
      const name = node.getText();
      console.log(name, "isRefedCallExpression");
      return ts.factory.createObjectLiteralExpression([]);
    }
  };
  it("具名导入", () => {
    const result = transformSpec(transformer, require.resolve("./named"), {
      config: {
        // afterDeclarations: true,
      },
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
      },
    });
    expect(result).toMatchSnapshot("named");
  });
  it("命名空间导入", () => {
    const result = transformSpec(transformer, require.resolve("./namespaced"), {
      config: {
        // afterDeclarations: true,
      },
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
      },
    });
    expect(result).toMatchSnapshot();
  });
});
