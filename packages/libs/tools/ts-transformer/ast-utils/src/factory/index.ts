import ts from "typescript";
import { createTransformContext } from "./context";
import { CustomTransformerConfig, VisitorContext } from "./types";
import { createHarmonyFactory } from "./utils/harmony-factory";

export type CustomTransformerHook<Config extends CustomTransformerConfig> = (
  this: VisitorContext<Config>,
  node: ts.Node,
  context: VisitorContext<Config>
) => ts.VisitResult<ts.Node>;

export function createCustomTransformer<Config extends CustomTransformerConfig>(
  nodeVisitor: CustomTransformerHook<Config>
) {
  return (transformationContext: ts.TransformationContext) => {
    const tsTransformPathsContext = createTransformContext<Config>(transformationContext);
    const { tsInstance } = tsTransformPathsContext;
    return (sourceFile: ts.SourceFile) => {
      const visitorContext: VisitorContext = {
        ...tsTransformPathsContext,
        sourceFile,
        isDeclarationFile: sourceFile.isDeclarationFile,
        originalSourceFile: (<typeof ts>tsInstance).getOriginalSourceFile(sourceFile),
        getVisitor() {
          return (node) => nodeVisitor.call(this, node, visitorContext);
        },
        factory: createHarmonyFactory(tsTransformPathsContext),
      };
      return tsInstance.visitEachChild(
        sourceFile,
        visitorContext.getVisitor(),
        transformationContext
      );
    };
  };
}
export * from "./context";
export * from "./types";
