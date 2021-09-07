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
  getOutputsForTargetAndConfiguration,
  toDependcyNodes,
  UpdateDepsContext,
  readPackageJson,
  readPackageJsonInTree,
} from "./getBuildablePackageJson";

const STATIC_DEPS = [
  "workspace-base-rig",
  "jest",
  "@types/heft-jest",
  "@types/node",
  "tslib",
  "typescript",
];
export function formatDeps(context: UpdateDepsContext, host?: Tree, projGraph?: TypedProjectGraph) {
  if (!host) return updateDeps(context, projGraph);
  return createDeps(context, host, projGraph);
}

/**
 * 为新项目创建
 * @param context
 * @param host
 * @param projGraph
 */
export function createDeps(
  context: UpdateDepsContext,
  host: Tree,
  projGraph = getProjectGraph()
): {
  dependencies: DependentBuildableProjectNode[];
  packageJsonPath: string;
  packageJson: PackageJSON;
} {
  const dependencies = toDependcyNodes(projGraph, context, STATIC_DEPS);
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
  projGraph = getProjectGraph()
): {
  dependencies: DependentBuildableProjectNode[];
  packageJsonPath: string;
  packageJson: PackageJSON;
} {
  const { target, dependencies } = calculateProjectDependencies(projGraph, context, STATIC_DEPS);
  // const outputs = getOutputsForTargetAndConfiguration(node); //.data.root
  const { packageJson, packageJsonPath } = readPackageJson(
    getOutputsForTargetAndConfiguration(target)
  );
  const { packageJson: workspacePackageJson } = readPackageJson(context.workspaceRoot);
  // console.log(dependencies.map(o => [o.name, o.node.data]));
  console.log("target is", target.data.projectType);
  return {
    packageJson: getBuildablePackageJson(context, packageJson, workspacePackageJson, dependencies),
    packageJsonPath,
    dependencies,
  };
}
