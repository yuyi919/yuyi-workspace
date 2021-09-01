import fs from "fs-extra";
import { join, relative, normalize } from "path";
import ts, {
  CompilerOptions,
  createProgram,
  CustomTransformers,
  ModuleKind,
  ScriptTarget,
  WriteFileCallback,
} from "typescript";
import { createTransformContext, CustomTransformerConfig, CustomTransformerHook, VisitorContext } from "../factory";
import { createHarmonyFactory } from "../factory/utils/harmony-factory";
import { Spec, SpecFactory } from "./spec";
export type CustomCompilerOptions<Config> = {
  throwError?: boolean;
  compilerOptions?: Partial<CompilerOptions>;
  tsConfig?: string;
  ts?: string;
  config?: Config;
};

export function transform<Config>(
  filePath: string,
  transformers: (program: ts.Program, options: CustomCompilerOptions<Config>) => CustomTransformers,
  options: CustomCompilerOptions<Config> = {}
) {
  const result: [string, string][] = [];
  compile(
    [filePath],
    transformers,
    (fileName, fileText) => {
      result.push([fileName, fileText]);
    },
    options
  );
  return result;
}
export function transformSpec<Config extends CustomTransformerConfig>(
  nodeVisitor: CustomTransformerHook<Config>,
  filePath: string,
  options?: CustomCompilerOptions<Config>
) {
  return transform(
    filePath,
    (program) => {
      const transformer: ts.TransformerFactory<ts.SourceFile> = (transformationContext) => {
        const context = createTransformContext<Config>(transformationContext, program);
        return (sourceFile) => {
          const visitorContext: VisitorContext<Config> = {
            ...context,
            sourceFile,
            isDeclarationFile: sourceFile.isDeclarationFile,
            originalSourceFile: (<typeof ts>context.tsInstance).getOriginalSourceFile(sourceFile),
            getVisitor() {
              function visitor(node: ts.Node) {
                const result = nodeVisitor.call(visitorContext, node, visitorContext);
                if (result !== void 0) {
                  return result;
                }
                return ts.visitEachChild(node, visitor, transformationContext);
              }
              return visitor;
            },
            factory: createHarmonyFactory(context),
          };
          return context.tsInstance.visitNode(sourceFile, visitorContext.getVisitor());
        };
      };
      const before = options?.config?.before ?? true
      const after = options?.config?.after || false
      const afterDeclarations = options?.config?.afterDeclarations || false
      console.log(`\nbefore %s\nafter: %s\nafterDeclarations: %s`, before, after, afterDeclarations)
      return {
        before: before && [transformer],
        after: after && [transformer],
        afterDeclarations: afterDeclarations && [transformer],
        // afterDeclarations: [transformer],
      };
    },
    options
  ).map(([path, code]) => [normalize(relative(join(__dirname, ".."), path)), code]);
}

export function compile<Config>(
  filePaths: string[],
  transformers: (program: ts.Program, options: CustomCompilerOptions<Config>) => CustomTransformers,
  writeFileCallback?: WriteFileCallback,
  {
    ts = "typescript",
    compilerOptions = {},
    tsConfig: configPath = "",
    ...options
  }: CustomCompilerOptions<Config> = {}
) {
  if (fs.existsSync(configPath)) {
    try {
      const json = fs.readJSONSync(configPath);
      compilerOptions = Object.assign({}, json.compilerOptions || {}, compilerOptions);
    } catch (error) {}
  }
  const program = (require(ts).createProgram as typeof createProgram)(filePaths, {
    strict: true,
    noEmitOnError: false,
    suppressImplicitAnyIndexErrors: true,
    target: ScriptTarget.ES5,
    esModuleInterop: true,
    module: ModuleKind.CommonJS,
    declaration: true,
    noEmitHelpers: false,
    noUnusedLocals: false,
    importHelpers: true,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    ...compilerOptions,
  });
  const r = program.emit(
    undefined,
    writeFileCallback,
    undefined,
    false,
    transformers(program, options)
  );
  if ((!options || options.throwError) && r.emitSkipped) {
    const { diagnostics } = r;
    throw new Error(diagnostics.map((diagnostic) => diagnostic.messageText).join("\n"));
  }
  return r;
}
