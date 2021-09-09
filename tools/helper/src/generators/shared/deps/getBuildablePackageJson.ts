import { readJson, Tree } from "@nrwl/devkit";
import {
  ProjectGraph,
  ProjectGraphNode,
  ProjectType,
} from "@nrwl/workspace/src/core/project-graph";
// import { getOutputsForTargetAndConfiguration } from '@nrwl/workspace/src/tasks-runner/utils';
import { readJsonFile } from "@nrwl/workspace/src/utils/fileutils";
import { join } from "path";
import {
  DependentBuildableProjectNode,
  LibProjectNode,
  NpmProjectNode,
  TypedProjectGraphNode,
} from "../graph";
import { PackageJSON } from "../../../common/packageJsonUtils";
// import { PackageJsonBuilder } from "../formatPackageJson";

export type UpdateDepsContext = {
  workspaceRoot: string;
  projectName: string;
  // projectDir: string;
  match?: (pkg: TypedProjectGraphNode, parent: TypedProjectGraphNode, deep: number) => boolean;
};

function isBuildable(node: TypedProjectGraphNode): boolean {
  // console.log(node);
  return node.data.targets?.build;
}

function recursivelyCollectDependencies(
  projectName: string,
  projGraph: ProjectGraph,
  acc: string[],
  match?: (pkg: ProjectGraphNode, parent: ProjectGraphNode, deep: number) => boolean,
  parent?: ProjectGraphNode,
  deep = -1
) {
  const node = projGraph.nodes[projectName];
  if (deep === -1 || (!acc.includes(projectName) && (match ? match(node, parent, deep) : true))) {
    deep !== -1 && acc.push(projectName);
    (projGraph.dependencies[projectName] || []).forEach((dependency) => {
      recursivelyCollectDependencies(dependency.target, projGraph, acc, match, node, deep + 1);
    });
  }
  return acc;
}
export function toDependcyNodes(
  projGraph: ProjectGraph,
  context: UpdateDepsContext,
  depNames: string[]
) {
  return depNames
    .map((dep) => {
      if (!dep.startsWith("!")) {
        const depNode =
          (projGraph.nodes["npm:" + dep] as NpmProjectNode) ||
          (projGraph.nodes[dep] as LibProjectNode);
        if (depNode) {
          if (isBuildable(depNode)) {
            const libPackageJson = readJsonFile(
              join(context.workspaceRoot, depNode.data.root, "package.json")
            );
            return {
              name: libPackageJson.name, // i.e. @workspace/mylib
              outputs: [getOutputPath(depNode)],
              node: depNode,
            };
          } else if (depNode.type === "npm") {
            return {
              // @ts-ignore
              name: depNode.data.packageName,
              outputs: [],
              node: depNode,
            };
          } else {
            return null;
          }
        }
        console.log("throw", dep);
      }
    })
    .filter((x) => !!x);
}
export function calculateProjectDependencies(
  projGraph: ProjectGraph,
  context: UpdateDepsContext,
  appendPackages: string[] = []
): { target: LibProjectNode; dependencies: DependentBuildableProjectNode[] } {
  const target = projGraph.nodes[context.projectName] as LibProjectNode;
  // gather the library dependencies
  const dependencies = recursivelyCollectDependencies(
    context.projectName,
    projGraph,
    [],
    context.match
  ).concat(appendPackages || []);
  return { target, dependencies: toDependcyNodes(projGraph, context, dependencies) };
}
export function isInternalPackage(node: ProjectGraphNode) {
  return (
    node.data?.tags?.includes("internal") || node.data?.nxJsonSection?.tags?.includes("internal")
  );
}
export function getOutputPath(node: ProjectGraphNode): string {
  return node.data.root;
}

export function readPackageJson(dir: string) {
  // const outputs = getOutputsForTargetAndConfiguration(node); //.data.root
  const packageJsonPath = join(dir, `package.json`);
  console.log("read packageJson(" + packageJsonPath + ")");
  try {
    const packageJson: PackageJSON = readJsonFile(packageJsonPath);
    return {
      packageJsonPath,
      packageJson: {
        ...packageJson,
        devDependencies: packageJson.devDependencies || {},
        dependencies: packageJson.dependencies || {},
      },
    };
  } catch (e) {
    console.error(e);
    // cannot find or invalid package.json
    return {
      packageJsonPath,
      packageJson: {} as PackageJSON,
    };
  }
}
export function readPackageJsonInTree(host: Tree, dir: string) {
  // const outputs = getOutputsForTargetAndConfiguration(node); //.data.root
  const packageJsonPath = join(dir, `package.json`);
  console.log("read packageJson in Tree(" + packageJsonPath + ")");
  try {
    const packageJson: PackageJSON = readJson(host, packageJsonPath);
    return {
      packageJsonPath,
      packageJson: {
        ...packageJson,
        devDependencies: packageJson.devDependencies || {},
        dependencies: packageJson.dependencies || {},
      },
    };
  } catch (e) {
    // cannot find or invalid package.json
    return readPackageJson(dir);
  }
}
export function getBuildablePackageJson(
  context: UpdateDepsContext,
  packageJson: PackageJSON,
  workspacePackageJson: PackageJSON,
  dependencies: DependentBuildableProjectNode[],
  typeOfDependency?: "dependencies" | "peerDependencies"
) {
  // console.log(workspacePackageJson);
  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.devDependencies = packageJson.devDependencies || {};
  packageJson.peerDependencies = packageJson.peerDependencies || {};

  let updatePackageJson = false;
  // console.log(dependencies);
  dependencies.forEach((entry) => {
    const packageName = entry.node.type === "npm" ? entry.node.data.packageName : entry.name;

    try {
      console.log("matched", packageName, entry.node.type);
      let depVersion: string;
      if (entry.node.type === ProjectType.lib && packageJson.name !== packageName) {
        const outputPath: string = getOutputPath(entry.node);
        console.log("matched", packageName, outputPath);
        depVersion =
          "workspace:" +
          readJsonFile(
            join(
              context.workspaceRoot,
              outputPath,
              outputPath.endsWith(".json") ? "" : "package.json"
            )
          ).version;
      } else if (entry.node.type === "npm") {
        // If an npm dep is part of the workspace devDependencies, do not include it the library
        if (
          // ts一般作为dev包，但工具包可能需要强依赖
          !["typescript", "tsdx", "tslib"].includes(entry.node.data.packageName) &&
          workspacePackageJson.devDependencies[entry.node.data.packageName]
        ) {
          return;
        }
        depVersion = entry.node.data.version;
      }
      console.log("matched", packageName + ":", depVersion);

      if (
        depVersion &&
        !hasDependency(packageJson, "dependencies", packageName, depVersion) &&
        !hasDependency(packageJson, "devDependencies", packageName, depVersion) &&
        !hasDependency(packageJson, "peerDependencies", packageName, depVersion)
      ) {
        updatePackageJson = true;
        setVersion(
          entry,
          packageName,
          depVersion,
          typeOfDependency ??
            (isInternalPackage(entry.node) || workspacePackageJson.dependencies[packageName]
              ? "devDependencies"
              : "dependencies")
        );
      }
    } catch (e) {
      // skip if cannot find package.json
    }
  });

  function setVersion(
    entry: DependentBuildableProjectNode,
    packageName: any,
    depVersion: string,
    type: string = "dependencies"
  ) {
    if (entry.node.type === ProjectType.lib) {
      packageJson[type][packageName] = depVersion;
    } else if (entry.node.type === "npm") {
      packageJson[type][entry.node.data.packageName] = depVersion;
    }
  }
  return packageJson;
}
// verify whether the package.json already specifies the dep
function hasDependency(
  outputJson: any,
  depConfigName: string,
  packageName: string,
  depVersion: string
) {
  if (outputJson[depConfigName]) {
    // console.log(outputJson[depConfigName][packageName], depVersion);
    return outputJson[depConfigName][packageName] === depVersion;
  } else {
    // console.log('false');
    return false;
  }
}
