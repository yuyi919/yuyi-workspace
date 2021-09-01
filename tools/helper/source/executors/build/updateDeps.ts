import { Tree } from "@nrwl/devkit";
import { createProjectGraph } from "@nrwl/workspace/src/core/project-graph";
import { DependentBuildableProjectNode } from "@nrwl/workspace/src/utils/buildable-libs-utils";
import { PackageJSON } from "../../common/packageJsonUtils";
import {
  calculateProjectDependencies,
  getBuildablePackageJson,
  getOutputsForTargetAndConfiguration,
  toDependcyNodes,
  UpdateDepsContext,
  readPackageJson,
  readPackageJsonInTree,
} from "./getBuildablePackageJson";

export function createDeps(context: UpdateDepsContext, host: Tree, projGraph = createProjectGraph()) {
  const dependencies = toDependcyNodes(projGraph, context, [
    "workspace-base-rig",
    "jest",
    "@types/heft-jest",
    "@types/node",
  ]);
  // const outputs = getOutputsForTargetAndConfiguration(node); //.data.root
  const { packageJson, packageJsonPath } = readPackageJsonInTree(host, context.projectDir);
  const { packageJson: workspacePackageJson } = readPackageJsonInTree(host, context.workspaceRoot);
  return {
    packageJson: getBuildablePackageJson(
      context,
      packageJson,
      workspacePackageJson,
      dependencies
      // .concat([
      //   {
      //     name: "@yuyi919/workspace-base-rig",
      //     node: {
      //       type: ProjectType.lib,
      //       name: "workspace-base-rig",
      //       ...projGraph.nodes["workspace-base-rig"],
      //       // data: {
      //         // root: relative(
      //         //   context.workspaceRoot,
      //         //   require.resolve("@yuyi919/workspace-base-rig/package.json")
      //         // ),
      //         // packageName: "@yuyi919/workspace-base-rig",
      //       // },
      //     },
      //     outputs: [],
      //   },
      // ])
    ),
    packageJsonPath,
    dependencies,
  };
}
export function updateDeps(context: UpdateDepsContext): {
  dependencies: DependentBuildableProjectNode[];
  packageJsonPath: string;
  packageJson: PackageJSON;
} {
  const projGraph = createProjectGraph();
  const { target, dependencies } = calculateProjectDependencies(projGraph, context, [
    "workspace-base-rig",
    "jest",
  ]);
  // const outputs = getOutputsForTargetAndConfiguration(node); //.data.root
  const { packageJson, packageJsonPath } = readPackageJson(
    getOutputsForTargetAndConfiguration(target)
  );
  const { packageJson: workspacePackageJson } = readPackageJson(context.workspaceRoot);
  // console.log(dependencies.map(o => [o.name, o.node.data]));
  console.log("target is", target.data.projectType);
  return {
    packageJson: getBuildablePackageJson(
      context,
      packageJson,
      workspacePackageJson,
      dependencies
      // .concat([
      //   {
      //     name: "@yuyi919/workspace-base-rig",
      //     node: {
      //       type: ProjectType.lib,
      //       name: "workspace-base-rig",
      //       ...projGraph.nodes["workspace-base-rig"],
      //       // data: {
      //         // root: relative(
      //         //   context.workspaceRoot,
      //         //   require.resolve("@yuyi919/workspace-base-rig/package.json")
      //         // ),
      //         // packageName: "@yuyi919/workspace-base-rig",
      //       // },
      //     },
      //     outputs: [],
      //   },
      // ])
    ),
    packageJsonPath,
    dependencies,
  };
}
