import { Tree } from "@nrwl/devkit";
import { merge, omit } from "lodash";
import { getProjectGraphWith, TypedProjectGraph } from ".";
import { PackageJSON } from "../../common/packageJsonUtils";
import { PackageBuilder } from "../../common/schema";
import { join } from "path";
import { EslintConfig } from "../../common/updateEslintConfig";
import { formatDeps, STATIC_DEPS } from "./deps";
import { tryUpdateJson } from "./file-utils";
import { CommonPackageScripts, Configures, updatePackageJson } from "./formatPackageJson";
import { DependentBuildableProjectNode } from "./graph";
import { getRushPackageDefinition } from "./rushUtils";

export class PackageConfigFilesBuilder {
  constructor(private host: Tree, private name: string, private configure: Configures) {}

  static setup(host: Tree, packageName: string, configure: Configures, graph?: TypedProjectGraph) {
    const Builder = this;
    const builder = new Builder(host, packageName, configure);
    builder.projGraph = graph || getProjectGraphWith(host);
    return builder;
  }

  projGraph!: TypedProjectGraph;
  dependencyNodes: DependentBuildableProjectNode[] = [];
  rootDir!: string;
  packageJsonPath!: string;
  packageJson!: PackageJSON;

  scripts!: CommonPackageScripts & Record<string, any>;
  deps!: string[];

  setupInit(presetName: PackageBuilder) {
    return this.setup(presetName);
  }
  setupUpdate(presetName: PackageBuilder) {
    return this.setup(presetName, true);
  }

  private setup(presetName: PackageBuilder, update?: boolean) {
    if (!(presetName in this.configure)) return
    const { scripts, deps } = this.configure[presetName];
    this.scripts = scripts;
    this.deps = deps;

    const {
      dependencies: dependencyNodes,
      packageJsonPath,
      packageJson,
      packageDir,
    } = formatDeps(
      {
        workspaceRoot: this.host.root,
        projectName: this.name,
        match: (node, parent, deep) => deep < 1,
      },
      this.host,
      this.projGraph,
      update,
      this.deps.concat(STATIC_DEPS)
    );
    this.dependencyNodes = dependencyNodes;
    this.packageJson = packageJson;
    this.packageJsonPath = packageJsonPath;
    this.rootDir = packageDir;
    return this;
  }

  writeJson(publishable?: boolean) {
    if (!this.packageJson) return
    const { dependencies, devDependencies, peerDependencies } = this.packageJson;
    tryUpdateJson(
      this.host,
      join(this.rootDir, ".eslintrc.json"),
      ({ extends: extend, ignorePatterns, ...json }: EslintConfig) => ({
        extends: "./node_modules/@yuyi919/workspace-base-rig/.eslintrc.json",
        ignorePatterns: (ignorePatterns || []).filter(
          (pattern) => pattern !== "!**/*" && pattern !== "!*"
        ),
        ...json,
      })
    );
    updatePackageJson(this.host, this.packageJsonPath, (json) => {
      if (publishable === void 0) {
        const packageDefinition = getRushPackageDefinition(this.host, json.name);
        if (packageDefinition) {
          publishable =
            packageDefinition.shouldPublish === true ||
            packageDefinition.versionPolicyName?.length > 0;
        }
      }
      const result = merge(json, {
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
      if (publishable !== void 0) {
        result.private = !publishable
      }
      for (const dep of this.deps) {
        if (dep.startsWith("!")) {
          const depName = dep.replace(/^\!/i, "");
          result.dependencies = omit(result.dependencies, depName);
          result.devDependencies = omit(result.devDependencies, depName);
          console.log("remove dep", depName);
        }
      }
      return result;
    });
  }
}
