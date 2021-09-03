import { readJson, Tree, writeJson } from "@nrwl/devkit";
import { sortObjectByKeys } from "@nrwl/workspace/src/utils/ast-utils";
import { defaultsDeep } from "lodash";
import { PackageJSON } from "../../common/packageJsonUtils";
import { sortObjectKeysWith } from "./getSortedProjects";

export async function updatePackageJson(
  host: Tree,
  jsonPath: string,
  callback: (json: PackageJSON) => PackageJSON
) {
  const keywords = [
    "name",
    "version",
    "description",
    "author",
    "keywords",
    "license",
    "private",
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
  const workspaceJson: PackageJSON = await readJson(host, jsonPath);
  const packageJson = defaultsDeep(callback(workspaceJson), {
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
  writeJson(
    host,
    jsonPath,
    sortObjectKeysWith(packageJson, (key) => {
      const index = keywords.indexOf(key);
      return index > -1 ? index : key;
    })
  );
}
