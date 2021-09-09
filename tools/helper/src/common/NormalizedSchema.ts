import { Tree } from "@angular-devkit/schematics";
import { getNpmScope, toFileName } from "@nrwl/workspace";
import { joinPathFragments, detectPackageManager, PackageManager } from "@nrwl/devkit";
import { libsDir } from "@nrwl/workspace/src/utils/ast-utils";
import { CommonSchema } from "./schema";
import { autoImportPath } from "./getDefaultImportPath";

export interface NormalizedSchema extends CommonSchema {
  name: string;
  prefix: string;
  fileName: string;
  projectRoot: string;
  sourceRoot: string;
  projectDirectory: string;
  parsedTags: string[];
  keywords: string[];
  packageManager: PackageManager;
}

export function normalizeOptions<T extends CommonSchema>(
  host: Tree,
  options: T
): T & NormalizedSchema {
  const defaultPrefix = getNpmScope(host);
  const name = toFileName(options.name);
  const projectDirectory = options.directory ? `${toFileName(options.directory)}/${name}` : name;

  const projectName = projectDirectory.replace(new RegExp("/", "g"), "-");
  const fileName = projectName;
  const projectRoot = joinPathFragments(libsDir(host), projectDirectory);
  const parsedTags = getParsedTags<T>(projectDirectory, options);
  const keywords = [defaultPrefix, ...parsedTags];
  const importPath = options.importPath || `@${defaultPrefix}/${projectDirectory}`;

  return {
    ...options,
    sourceRoot: joinPathFragments(projectRoot, "src"),
    prefix: defaultPrefix,
    fileName,
    name: projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    keywords,
    importPath,
    packageManager: detectPackageManager(process.cwd()),
  };
}
export function getParsedTags<T extends CommonSchema>(projectDirectory: string, options: T) {
  return Array.from(
    new Set<string>(
      generateTags(projectDirectory.replace(/\\packages/g, "")).concat(
        options.tags ? options.tags.split(",").map((s) => s.trim()) : []
      )
    )
  );
}

function generateTagsInline(keyword: string) {
  return Array.from(new Set(keyword.split("-"))).reduce(
    (tags, pieace, prevIndex) => [
      ...tags,
      prevIndex > 0 ? [tags[prevIndex - 1], pieace].join("-") : pieace,
    ],
    []
  );
}
function generateTags(projectDirectory: string) {
  return projectDirectory.split(/\/|\./).map(generateTagsInline).flat(1);
}

export function preOptions<T extends CommonSchema>(options: T, host: Tree): T {
  const { name } = options;
  const projectDirectory = options.directory ? `${toFileName(options.directory)}/${name}` : name;
  const parsedTags = generateTags(projectDirectory);

  options = {
    ...options,
    directory: options.directory,
    buildable: true,
    publishable: true,
    babelJest: false,
    unitTestRunner: "none",
    skipFormat: false,
    rootDir: "./dist",
    importPath: options.importPath || autoImportPath(getNpmScope(host), options),
    tags: Array.from(
      new Set((options.tags ? options.tags.split(",") : []).concat(parsedTags).map((s) => s.trim()))
    ),
    // standaloneConfig: true,
  };
  return options;
}

export type NormalizedOptions = ReturnType<typeof normalizeOptions>;
