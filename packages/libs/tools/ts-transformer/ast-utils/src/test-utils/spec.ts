import ts from "typescript";
import { readFileSync } from "fs-extra";
import { createTransformContext } from "../factory/context";
import { CustomTransformerContext } from "../factory/types";

export type Spec = (
  node: ts.Node,
  context: CustomTransformerContext
) => ts.Node | void | undefined | false;
export type SpecFactory = (
  context: CustomTransformerContext
) => (node: ts.Node) => ts.Node | void | undefined | false;

export function spec(spec: Spec, path: string) {
  return testCode(spec, readFileSync(path).toString(), path);
}
// endregion

/* ****************************************************************************************************************** */
// region: Transformer
/* ****************************************************************************************************************** */

export function createTransformer(spec: Spec) {}

export function testCode(spec: Spec, code: string, path = "") {
  const sourceFile = ts.createSourceFile(
    path,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  ts.transform(sourceFile, [
    (transformationContext) => {
      const context = createTransformContext(transformationContext, void 0, {}, void 0, {
        fileNames: [path],
        compilerOptions: transformationContext.getCompilerOptions(),
      });
      return (sourceFile) => {
        function visitor(node: ts.Node) {
          const result = spec(node, context);
          if (result) {
            return result;
          }
          return ts.visitEachChild(node, visitor, transformationContext);
        }
        return ts.visitNode(sourceFile, visitor);
      };
    },
  ]);
}
