/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-empty */
import fs, { writeFileSync } from "fs-extra";
// import { transform as tsTransform } from "typescript";
import path from "path";

export const projectPath = (pathStr: string) => path.relative(process.cwd(), pathStr);
import ts, {
  CompilerOptions,
  createProgram,
  CustomTransformers,
  ModuleKind,
  ScriptTarget,
  WriteFileCallback,
} from "typescript";

export type CustomCompilerOptions = {
  throwError?: boolean;
  compilerOptions?: Partial<CompilerOptions>;
  tsConfig?: string;
  ts?: string;
};

export function transform(
  filePath: string,
  transformers: (program: ts.Program, options: CustomCompilerOptions) => CustomTransformers,
  options: CustomCompilerOptions = {}
) {
  const result: [string, string][] = [];
  const r = compile(
    [filePath],
    transformers,
    (fileName, fileText) => {
      result.push([fileName, fileText]);
    },
    options
  );
  return result;
}
export function compile(
  filePaths: string[],
  transformers: (program: ts.Program, options: CustomCompilerOptions) => CustomTransformers,
  writeFileCallback?: WriteFileCallback,
  {
    ts = "typescript",
    compilerOptions = {},
    tsConfig: configPath = "",
    ...options
  }: CustomCompilerOptions = {}
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

export function transformTs(
  filePaths: string[],
  transformers: (program: ts.Program, options: CustomCompilerOptions) => CustomTransformers,
  writeFileCallback?: WriteFileCallback,
  {
    ts = "typescript",
    compilerOptions = {},
    tsConfig: configPath = "",
    ...options
  }: CustomCompilerOptions = {}
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
export function transformESModule(
  filePath: string,
  transformers: (program: ts.Program, options: CustomCompilerOptions) => CustomTransformers,
  {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    compilerOptions: { module, allowJs, target, removeComments, ...other } = {},
  }: CustomCompilerOptions = {}
) {
  const result = transform(filePath, transformers, {
    compilerOptions: {
      target: target ?? ts.ScriptTarget.ESNext,
      module: module ?? ts.ModuleKind.ESNext,
      removeComments: removeComments ?? true,
      allowJs: allowJs ?? false,
      ...other,
    },
  });
  for (const [filename, code] of result) {
    writeFileSync(filename, code);
  }
  return result[result.length - 1];
}

export function transformCommonJS(
  filePath: string,
  transformers: (program: ts.Program, options: CustomCompilerOptions) => CustomTransformers,
  {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    compilerOptions: { module, allowJs, target, removeComments, ...other } = {},
  }: CustomCompilerOptions = {}
) {
  let outputPath: string;
  const result = transform(filePath, transformers, {
    compilerOptions: {
      target: target ?? ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS,
      removeComments: removeComments ?? true,
      ...other,
      allowJs: allowJs ?? false,
    },
  });
  for (const [filename, code] of result) {
    writeFileSync(filename, code);
    outputPath = filename;
  }
  return [outputPath, result] as const;
}

export type TransformerResultContext<T> = {
  origin: T;
  target: T;
  diff<R>(handle: (diffT: T) => R): TransformerResultContext<T>;
  diffEqual<R>(handle: (diffT: T) => R): TransformerResultContext<T>;
};
export function defineContext<T, Append>(
  origin: T,
  target: T,
  append: Append
): TransformerResultContext<T> & Append {
  const context = {
    origin,
    target,
    diff<R>(handle: (diffT: T) => R) {
      expect(handle(origin)).toBe(handle(target));
      return context;
    },
    diffEqual<R>(handle: (diffT: T) => R) {
      expect(handle(origin)).toEqual(handle(target));
      return context;
    },
    ...append,
  };
  return context;
}
/**
 * 模拟测试transformer
 *
 */
export function createTestContext(
  transformer: (program: ts.Program, options: CustomCompilerOptions) => CustomTransformers,
  options?: CustomCompilerOptions,
  requireDir: string = process.cwd()
) {
  const context = {
    transform(path: string) {
      return transform(path, transformer, options);
    },
    transformESModule(path: string) {
      return transformESModule(path, transformer, options);
    },
    transformCommonJS(path: string) {
      return transformCommonJS(path, transformer, options);
    },
    // transformTs(path: string) {
    //   const sourceFile = transformTs([path], transformer, options)
    //   return tsTransform(path, transformer, options);
    // },
    async evalTest<T>(importResolve: Promise<T>, resolveUrl: string) {
      const importUrl = require.resolve(resolveUrl, { paths: [requireDir] });
      const origin = await importResolve;
      const [resultUrl, resultCodeMap] = transformCommonJS(importUrl, transformer, options);
      const target: T = require(resultUrl);
      const context = defineContext(origin, target, {
        resultCodeMap,
      });
      return context;
    },
  };
  return context;
}

export * from "./printNodes";
