import { getWorkspaceLayout, joinPathFragments, PackageManager, Tree } from "@nrwl/devkit";
import { toFileName } from "@nrwl/workspace";
import { PackageBuilder } from "../../common/schema";
import { autoImportPath } from "../../common/getDefaultImportPath";
import { getParsedTags, NormalizedSchema } from "../../common/NormalizedSchema";
import { LibProjectNode } from "../shared";
import { Schema } from "./schema";
export interface NormalizedOptions {
  publishable: boolean;
  importPath: string;
  builder: PackageBuilder;
  prefix: string;
  fileName: string;
  name: string;
  projectRoot: string;
  sourceRoot: string;
  projectDirectory: string;
  parsedTags: string[];
  keywords: string[];
  packageManager: PackageManager;
}

export function normalizeSchema(tree: Tree, options: Schema): Schema {
  const { npmScope } = getWorkspaceLayout(tree);
  const name = toFileName(options.name);
  const projectDirectory = options.directory ? `${toFileName(options.directory)}/${name}` : name;
  const importPath = options.importPath || autoImportPath(npmScope, options);
  const parsedTags = getParsedTags(projectDirectory, options);
  return {
    ...options,
    directory: options.directory,
    buildable: true,
    publishable: true,
    babelJest: false,
    simpleModuleName: true,
    skipTsConfig: true,
    rootDir: "./dist",
    tags: parsedTags.join(","),
    importPath,
    linter: "eslint" as any,
  };
}

export function normalizeOptions(host: Tree, options: Schema): NormalizedOptions {
  const { npmScope, libsDir } = getWorkspaceLayout(host);
  const defaultPrefix = npmScope;
  const name = toFileName(options.name);
  const projectDirectory = options.directory ? `${toFileName(options.directory)}/${name}` : name;

  const projectName = projectDirectory.replace(new RegExp("/", "g"), "-");
  const fileName = options.simpleModuleName ? name : projectName;
  const projectRoot = joinPathFragments(libsDir, projectDirectory);

  const parsedTags = options.tags?.split(",") || [];
  const keywords = [defaultPrefix, ...parsedTags];

  return {
    publishable: options.publishable,
    importPath: options.importPath || autoImportPath(npmScope, options),
    builder: options.builder,
    prefix: defaultPrefix,
    fileName,
    name: projectName,
    projectRoot,
    sourceRoot: joinPathFragments(projectRoot, "src"),
    projectDirectory,
    parsedTags,
    keywords,
    packageManager: "pnpm" as PackageManager, //detectPackageManager(host.root),
  };
}

export function convertOptionsToProjectNode(options: NormalizedOptions): LibProjectNode {
  return {
    type: "lib",
    data: {
      projectType: "library",
      sourceRoot: joinPathFragments(options.projectRoot, "src"),
      builder: options.builder as "tsdx" | "tsc",
      root: options.projectRoot,
      tags: options.parsedTags,
      targets: {},
      files: [],
    },
    name: options.name,
  };
}
