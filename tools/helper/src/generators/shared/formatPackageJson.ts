import { Tree, updateJson, writeJson } from "@nrwl/devkit";
import { sortObjectByKeys } from "@nrwl/workspace/src/utils/ast-utils";
import { defaultsDeep } from "lodash";
import { PackageJSON } from "../../common/packageJsonUtils";
import { tryReadJson } from "./file-utils";
import { sortObjectKeysWith } from "./getSortedProjects";
import { PackageBuilder } from "../../common/schema";
export interface ConfigureItem {
  scripts: CommonPackageScripts & Record<string, any>;
  deps: string[];
  entry?: {
    main?: string,
    module?: string,
    types?: string
  } 
}
export interface Configures extends Partial<Record<PackageBuilder, ConfigureItem>> {}
export function definePackageJsonBuilder(configure: Configures) {
  return configure;
}

export interface CommonPackageScripts {
  build: string;
  "build:watch": string;
  "build:dev": string;
  dev: string;
  test?: string;
  "test:watch"?: string;
  // "lint": string;
}

export function writePackageJson(host: Tree, jsonPath: string, json: PackageJSON) {
  const keywords = [
    "name",
    "private",
    "version",
    "description",
    "author",
    "keywords",
    "license",
    "main",
    "module",
    "types",
    "sideEffect",
    "scripts",
    "bin",
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "files",
  ] as (keyof PackageJSON)[];
  const packageJson = defaultsDeep(json, {
    description: "",
    author: "",
  }) as PackageJSON;
  if (packageJson.keywords) packageJson.keywords = packageJson.keywords.sort();
  if (packageJson.scripts) packageJson.scripts = sortObjectByKeys(packageJson.scripts);
  if (packageJson.dependencies)
    packageJson.dependencies = sortObjectByKeys(packageJson.dependencies);
  if (packageJson.devDependencies)
    packageJson.devDependencies = sortObjectByKeys(packageJson.devDependencies);
  if (packageJson.peerDependencies)
    packageJson.peerDependencies = sortObjectByKeys(packageJson.peerDependencies);
  const result = sortObjectKeysWith(packageJson, (key) => {
    const index = keywords.indexOf(key);
    return index > -1 ? index : key;
  });
  if (!result.private) {
    delete result["private"];
  }
  writeJson(host, jsonPath, result);
}
export function updatePackageJson(
  host: Tree,
  jsonPath: string,
  callback: (json: PackageJSON) => PackageJSON | void
) {
  const sourceJson = tryReadJson<PackageJSON>(host, jsonPath);
  writePackageJson(host, jsonPath, callback(sourceJson) || sourceJson);
}

export function formatWorkspacePackageJson(host: Tree) {
  updateJson(host, "package.json", (pkg: PackageJSON) => {
    if (pkg.devDependencies) {
      if (pkg.dependencies) {
        for (const key in pkg.devDependencies) {
          if (key in pkg.dependencies) {
            delete pkg.devDependencies[key];
          }
        }
      }
      // 移除@types/jest, 因为不需要
      delete pkg.devDependencies["@types/jest"];
      // console.log(pkg);
    }
    return pkg;
  });
}
