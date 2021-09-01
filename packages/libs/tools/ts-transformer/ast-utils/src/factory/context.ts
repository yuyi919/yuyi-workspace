import { Minimatch } from "minimatch";
import path from "path";
import { TransformerExtras } from "ts-patch";
import ts from "typescript";
import tsThree from "./declarations/typescript3";
import { CustomTransformerConfig, CustomTransformerContext, TypeScriptThree } from "./types";
import { cast } from "./utils/helper";
import { createSyntheticEmitHost, getTsNodeRegistrationProperties } from "./utils/ts-helper";

export function createTransformContext<TransformerConfig extends CustomTransformerConfig>(
  transformationContext: ts.TransformationContext,
  program?: ts.Program,
  pluginConfig?: TransformerConfig,
  transformerExtras?: Partial<TransformerExtras>,
  /**
   * Supply if manually transforming with compiler API via 'transformNodes' / 'transformModule'
   */
  manualTransformOptions?: {
    compilerOptions?: ts.CompilerOptions;
    fileNames?: string[];
  }
): CustomTransformerContext<TransformerConfig> {
  let tsInstance: typeof ts;
  let compilerOptions: ts.CompilerOptions;
  let fileNames: readonly string[] | undefined;
  let isTsNode = false;

  tsInstance = transformerExtras?.ts ?? ts;
  compilerOptions = manualTransformOptions?.compilerOptions!;

  if (program) {
    compilerOptions ??= program.getCompilerOptions();
  } else if (manualTransformOptions) {
    fileNames = manualTransformOptions.fileNames;
  } else {
    const tsNodeProps = getTsNodeRegistrationProperties(tsInstance);
    if (!tsNodeProps)
      throw new Error(
        `Cannot transform without a Program, ts-node instance, or manual parameters supplied. ` +
          `Make sure you're using ts-patch or ts-node with transpileOnly.`
      );
    isTsNode = true;
    compilerOptions = tsNodeProps?.compilerOptions || transformationContext.getCompilerOptions();
    fileNames = tsNodeProps?.fileNames;
  }

  const rootDirs = compilerOptions.rootDirs?.filter(path.isAbsolute);
  const config: TransformerConfig = pluginConfig ?? ({} as TransformerConfig);
  const getCanonicalFileName = tsInstance.createGetCanonicalFileName(
    tsInstance.sys.useCaseSensitiveFileNames
  );

  let emitHost = transformationContext.getEmitHost();
  if (!emitHost) {
    if (!fileNames)
      throw new Error(
        `No EmitHost found and could not determine files to be processed. Please file an issue with a reproduction!`
      );
    emitHost = createSyntheticEmitHost(
      compilerOptions,
      tsInstance,
      getCanonicalFileName,
      fileNames as string[]
    );
  } else if (isTsNode) {
    Object.assign(emitHost, { getCompilerOptions: () => compilerOptions });
  }

  const { configFile, paths } = compilerOptions;
  // TODO - Remove typecast when tryParsePatterns is recognized (probably after ts v4.4)
  const { tryParsePatterns } = tsInstance as any;
  return {
    compilerOptions,
    config,
    elisionMap: new Map(),
    tsFactory: transformationContext.factory,
    program,
    tsThreeProgram: cast<tsThree.Program>(program),
    rootDirs,
    transformationContext,
    tsInstance,
    emitHost,
    isTsNode,
    tsThreeInstance: cast<TypeScriptThree>(tsInstance),
    excludeMatchers: config.exclude?.map(
      (globPattern) => new Minimatch(globPattern, { matchBase: true })
    ),
    outputFileNamesCache: new Map(),
    // Get paths patterns appropriate for TS compiler version
    pathsPatterns:
      paths &&
      (tryParsePatterns
        ? // TODO - Remove typecast when pathPatterns is recognized (probably after ts v4.4)
          (configFile?.configFileSpecs as any)?.pathPatterns || tryParsePatterns(paths)
        : tsInstance.getOwnKeys(paths)),
  };
}
