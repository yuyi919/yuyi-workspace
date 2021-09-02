import { detectPackageManager, getWorkspaceLayout, joinPathFragments, Tree } from "@nrwl/devkit";
import { Schema } from "../../schematics/internal-nx-plugins-lerna/schema";
import { getParsedTags, NormalizedSchema } from "../../common/NormalizedSchema";
import { toFileName } from "@nrwl/workspace";
import { autoImportPath } from "../../common/getDefaultImportPath";
import { ProjectNode } from "../../executors/build/getBuildablePackageJson";

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
    linter: "eslint" as any
  };
}
export function normalizeOptions(host: Tree, options: Schema): Schema & NormalizedSchema {
  options = {
    ...options,
  };
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
    ...options,
    prefix: defaultPrefix,
    fileName,
    name: projectName,
    projectRoot,
    sourceRoot: joinPathFragments(projectRoot, "src"),
    projectDirectory,
    parsedTags,
    keywords,
    packageManager: detectPackageManager(host.root),
  };
}

export function convertOptionsToProjectNode(options: Schema & NormalizedSchema): ProjectNode {
  return {
    type: "library",
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
