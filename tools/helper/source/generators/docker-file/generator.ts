import { formatFiles, readJson, readProjectConfiguration, Tree } from "@nrwl/devkit";
import { ProjectType } from "@nrwl/workspace";
import { createProjectGraph } from "@nrwl/workspace/src/core/project-graph";
import {
  calculateProjectDependencies,
  ProjectNode,
} from "../../executors/build/getBuildablePackageJson";
import { WorkspaceJson } from "../../common/ProjectConfig";
import { PackageBuilder } from "../../schematics/internal-nx-plugins-lerna/schema";
import { DockerFileGeneratorSchema } from "./schema";

export const projectTypeSort: Record<ProjectType, number> = [
  ProjectType.Application,
  ProjectType.Library,
].reduce((r, key, index) => ({ ...r, [key]: index }), {} as any);

export async function updateWorkspace(
  host: Tree,
  callback: (json: WorkspaceJson) => WorkspaceJson
) {
  const workspaceJson: WorkspaceJson = await readJson(host, "workspace.json");
  host.write("workspace.json", JSON.stringify(callback(workspaceJson)));
}

export default async function (host: Tree, options: DockerFileGeneratorSchema) {
  const prev = Object.assign(
    { builder: "auto" as PackageBuilder },
    readProjectConfiguration(host, options.project)
  );

  const graph = createProjectGraph();
  const node = (graph.nodes[options.project] as ProjectNode)?.data;

  const { target, dependencies } = calculateProjectDependencies(graph, {
    workspaceRoot: process.cwd(),
    projectDir: options.project,
    // 如果该依赖项不为内部包，收集依赖
    match: (node, parent, deep) => {
      console.log(node.name, parent.name);
      return node.type !== "npm";
    },
  });
  console.log(dependencies.map((d) => d.name));

  await formatFiles(host);
}
