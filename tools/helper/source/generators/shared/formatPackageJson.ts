import { Tree, updateJson, writeJson } from "@nrwl/devkit";
import { sortObjectByKeys } from "@nrwl/workspace/src/utils/ast-utils";
import { defaultsDeep, merge } from "lodash";
import { PackageJSON } from "../../common/packageJsonUtils";
import { tryReadJson } from "./file-utils";
import { STATIC_DEPS, formatDeps, UpdateDepsContext } from "./deps";
import { sortObjectKeysWith } from "./getSortedProjects";
import { DependentBuildableProjectNode } from "./graph";
import { getProjectGraphWith, TypedProjectGraph } from ".";
import { PackageBuilder } from "../../common/schema";
export interface ConfigureItem {
  scripts: CommonPackageScripts & Record<string, any>;
  deps: string[];
}
export interface Configures extends Partial<Record<PackageBuilder, ConfigureItem>> {}
export function definePackageJsonBuilder(configure: Configures) {
  return configure;
}

export class PackageJsonBuilder {
  constructor(private host: Tree, private name: string, private configure: Configures) {}

  static setup(host: Tree, packageName: string, configure: Configures, graph?: TypedProjectGraph) {
    const Builder = this;
    const builder = new Builder(host, packageName, configure)
    builder.projGraph = graph || getProjectGraphWith(host)
    return builder;
  }

  projGraph!: TypedProjectGraph;
  dependencyNodes!: DependentBuildableProjectNode[];
  path!: string;
  json!: PackageJSON;

  scripts!: CommonPackageScripts & Record<string, any>;
  deps!: string[];

  setupInit(presetName: PackageBuilder) {
    return this.setup(presetName)
  }
  setupUpdate(presetName: PackageBuilder) {
    return this.setup(presetName, true)
  }

  private setup(presetName: PackageBuilder, update?: boolean) {
    if (!(presetName in this.configure)) throw Error("未找到builder");
    const { scripts, deps } = this.configure[presetName];
    this.scripts = scripts;
    this.deps = deps;

    const {
      dependencies: dependencyNodes,
      packageJsonPath,
      packageJson,
    } = formatDeps(
      {
        workspaceRoot: this.host.root,
        projectName: this.name,
      },
      this.host,
      this.projGraph,
      update,
      this.deps.concat(STATIC_DEPS)
    );
    this.dependencyNodes = dependencyNodes;
    this.json = packageJson;
    this.path = packageJsonPath;
    return this;
  }

  writeJson(publishable?: boolean) {
    const { dependencies, devDependencies, peerDependencies } = this.json;
    updatePackageJson(this.host, this.path, (json) => {
      return merge(json, {
        private: !publishable,
        scripts: this.scripts,
        main: "dist/index.js",
        module: "lib/index.js",
        types: "dist/index.d.ts",
        publishConfig: {
          access: "public",
        },
        dependencies,
        devDependencies,
        peerDependencies,
        files: ["dist", "lib", "README.md"],
      });
    });
  }
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
