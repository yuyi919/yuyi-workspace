import { getProjects, readProjectConfiguration, Tree } from "@nrwl/devkit";
import * as enquirer from "enquirer";
import { ProjectConfig } from "../../common/ProjectConfig";
import {
  formatFiles,
  getProjectGraphWith,
  PackageBuilder,
  ProjectGraphNodeData,
  TypedProjectGraph,
} from "../shared";
import { FormatGeneratorSchema } from "./schema";
import { updateFiles } from "./updateFiles";

export default async function (host: Tree, options: FormatGeneratorSchema) {
  const graph = getProjectGraphWith(host);
  const projrects = Array.from(getProjects(host).keys());
  const targets = options.project ? [options.project] : options.all ? projrects : [];
  if (targets.length === 0) {
    const { project = [] } = await enquirer.prompt<{ project: string[] }>({
      name: "project",
      message: "请选择要格式化的项目",
      type: "multiselect",
      choices: projrects.filter((name) => !name.endsWith("-rig")),
    });
    targets.push(...project);
  }
  await Promise.all(
    targets.map((target) => updateFiles(host, { ...options, project: target }, graph))
  );
  // await updateWorkspace(host, (workspaceJson) => {
  //   return {
  //     ...workspaceJson,
  //     projects: getSortedProjects(workspaceJson.projects, graph),
  //   };
  // });
  return await formatFiles(host, graph);
}

export function readProjectConfigurationWithBuilder(
  host: Tree,
  name: string,
  builder?: PackageBuilder | "auto"
) {
  const project = readProjectConfiguration(host, name) as ProjectConfig;
  builder = (builder && builder !== "auto" ? builder : project.builder) || "tsc";
  return Object.assign(project, { builder }) as ProjectGraphNodeData;
}

export function getLibraryFromGraph(graph: TypedProjectGraph, name: string) {
  const node = graph.nodes[name];
  if (node.type === "lib") return node;
  throw Error(`Project[${name}]不为Library!`);
}
