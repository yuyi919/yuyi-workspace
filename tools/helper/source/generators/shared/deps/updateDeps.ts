import { Tree } from "@nrwl/devkit";
import {
  getLibraryFromGraph,
  DependentBuildableProjectNode,
  getProjectGraph,
  TypedProjectGraph,
} from "../graph";
import { PackageJSON } from "../../../common/packageJsonUtils";
import {
  calculateProjectDependencies,
  getBuildablePackageJson,
  getOutputPath,
  toDependcyNodes,
  UpdateDepsContext,
  readPackageJson,
  readPackageJsonInTree,
} from "./getBuildablePackageJson";

export const STATIC_DEPS = [
  "@types/node",
  "workspace-base-rig",
  "jest",
  "tslib",
  "typescript",
];
export function formatDeps(
  context: UpdateDepsContext,
  host?: Tree,
  projGraph?: TypedProjectGraph,
  update?: boolean,
  deps = STATIC_DEPS
) {
  if (!host || update === true) return updateDeps(context, deps, projGraph);
  return createDeps(host, context, deps,  projGraph);
}

/**
 * 为新项目创建
 * @param context
 * @param host
 * @param projGraph
 */
export function createDeps(
  host: Tree,
  context: UpdateDepsContext,
  deps: string[],
  projGraph = getProjectGraph()
): {
  dependencies: DependentBuildableProjectNode[];
  packageJsonPath: string;
  packageJson: PackageJSON;
} {
  const dependencies = toDependcyNodes(projGraph, context, deps);
  const projectNode = getLibraryFromGraph(projGraph, context.projectName);
  // const outputs = getOutputsForTargetAndConfiguration(node); //.data.root
  const { packageJson, packageJsonPath } = readPackageJsonInTree(host, projectNode.data.root);
  const { packageJson: workspacePackageJson } = readPackageJsonInTree(host, context.workspaceRoot);
  return {
    packageJson: getBuildablePackageJson(context, packageJson, workspacePackageJson, dependencies),
    packageJsonPath,
    dependencies,
  };
}
export function updateDeps(
  context: UpdateDepsContext,
  deps: string[],
  projGraph = getProjectGraph()
): {
  dependencies: DependentBuildableProjectNode[];
  packageJsonPath: string;
  packageJson: PackageJSON;
} {
  const { target, dependencies } = calculateProjectDependencies(projGraph, context, deps);
  // const outputs = getOutputsForTargetAndConfiguration(node); //.data.root
  const { packageJson, packageJsonPath } = readPackageJson(getOutputPath(target));
  const { packageJson: workspacePackageJson } = readPackageJson(context.workspaceRoot);
  // console.log(dependencies.map(o => [o.name, o.node.data]));
  console.log("target is", target.data.projectType);
  return {
    packageJson: getBuildablePackageJson(context, packageJson, workspacePackageJson, dependencies),
    packageJsonPath,
    dependencies,
  };
}
