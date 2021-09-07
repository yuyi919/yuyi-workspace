import {
  getProjects,
  readJson,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from "@nrwl/devkit";
import { createProjectGraph } from "@nrwl/workspace/src/core/project-graph";
import { defaultsDeep } from "lodash";
import * as Path from "path";
import { ProjectNode } from "../../executors/build/getBuildablePackageJson";
import { formatDeps } from "../../executors/build/updateDeps";
import { generateTscFiles } from "../../schematics/internal-nx-plugins-lerna/addLibFiles";
import { PackageBuilder } from "../../schematics/internal-nx-plugins-lerna/schema";
import { updateProject } from "../library/updateProject";
import { formatFiles } from "./format-files";
import { updatePackageJson } from "./formatPackageJson";
import * as enquirer from "enquirer";
import { FormatGeneratorSchema } from "./schema";

export default async function (host: Tree, options: FormatGeneratorSchema) {
  const graph = createProjectGraph();
  const projrects = Array.from(getProjects(host).entries());
  const targets = options.project
    ? [options.project]
    : options.all
    ? projrects.map((o) => o[0])
    : [];
  if (targets.length === 0) {
    const { project = [] } = await enquirer.prompt<{ project: string[] }>({
      name: "project",
      message: "请选择要格式化的项目",
      type: "multiselect",
      choices: projrects.map((o) => o[0]).filter(name => !name.endsWith("-rig")),
    });
    targets.push(...project);
  }
  await Promise.all(
    targets.map((target) => formatProject(host, { ...options, project: target }, graph))
  );
  // await updateWorkspace(host, (workspaceJson) => {
  //   return {
  //     ...workspaceJson,
  //     projects: getSortedProjects(workspaceJson.projects, graph),
  //   };
  // });
  return await formatFiles(host, graph);
}
async function formatProject(host: Tree, options: FormatGeneratorSchema, graph) {
  const project = Object.assign(
    { builder: "auto" as PackageBuilder },
    readProjectConfiguration(host, options.project)
  );

  const node = (graph.nodes[options.project] as ProjectNode)?.data;
  const builder =
    (options.builder && options.builder !== "auto" ? options.builder : project.builder) || "auto";

  const {
    dependencies: deps,
    packageJson,
    packageJsonPath,
  } = formatDeps({
    workspaceRoot: process.cwd(),
    projectDir: options.project,
    // 如果该依赖项不为内部包，收集依赖
    match: (node, parent, deep) => deep < 1,
  });
  if (node && node.projectType === "library") {
    console.log("builder:", builder);
    if (builder === "tsc") {
      const tsconfigReferences = deps
        .filter((i) => i.node.data.projectType === "library" && i.node.data.builder === "tsc")
        .map((dep) => {
          const file = dep.node.data.files.find((i) => /tsconfig\.json$/.test(i.file));
          return file && Path.relative(node.root, file.file).replace(/\\/g, "/");
        })
        .filter(Boolean);
      console.log("tsconfig references:", tsconfigReferences);
      generateTscFiles(host, {
        name: options.project,
        projectRoot: project.root,
        references: tsconfigReferences.map((path) => (/^\./.test(path) ? path : "./" + path))
      });
    }
    if (project.targets.build) {
      const buildOptions = project.targets.build.options || {};
      // 标准化outputs
      const outputs = [
        buildOptions.outputPath
          ? "{options.outputPath}"
          : buildOptions.cwd
          ? "{options.cwd}"
          : project.root,
      ];
      updateProjectConfiguration(host, options.project, {
        ...project,
        tags: node.tags,
        //@ts-ignore
        builder,
        targets: {
          ...project.targets,
          build: {
            ...project.targets.build,
            outputs,
          },
        },
      });
    }
  }

  updatePackageJson(host, packageJsonPath, () => {
    return defaultsDeep({
      ...packageJson,
      scripts: {
        ...packageJson.scripts,
        build: "heft build --clean",
        dev: "heft build --watch",
        test: "heft test",
        "test:watch": "heft test --watch",
        "nx:format": `nx run ${options.project}:command:format`,
      },
    });
  });

  updateProject(host, {
    name: options.project,
    packageManager: "pnpm",
    projectRoot: project.root,
  });
}
