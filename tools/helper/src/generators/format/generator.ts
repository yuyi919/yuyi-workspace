import { getProjects, readProjectConfiguration, Tree } from "@nrwl/devkit";
import * as enquirer from "enquirer";
import { ProjectConfig } from "../../common/ProjectConfig";
import {
  formatFiles,
  getProjectGraphWith,
  PackageBuilder,
  LibProjectGraphNodeData,
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
  return await formatFiles(host, graph);
}

export function readProjectConfigurationWithBuilder(
  host: Tree,
  name: string,
  builder?: PackageBuilder | "auto"
) {
  const project = readProjectConfiguration(host, name) as ProjectConfig;
  builder = getNormlizedBuilder(builder, project.builder);
  return Object.assign(project, { builder }) as LibProjectGraphNodeData;
}

export function getNormlizedBuilder(
  builder: PackageBuilder | "auto",
  builderInProjcet?: PackageBuilder
): "tsdx" | "tsc" | "heft-tsc" | "auto" {
  return (builder && builder !== "auto" ? builder : builderInProjcet) || "tsc";
}
