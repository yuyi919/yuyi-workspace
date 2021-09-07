import { getProjects, readProjectConfiguration, Tree } from "@nrwl/devkit";
import * as enquirer from "enquirer";
import { defaultsDeep } from "lodash";
import * as Path from "path";
import { ProjectConfig } from "../../common/ProjectConfig";
import {
  formatDeps,
  formatFiles,
  generateTscFiles,
  getProjectGraphWith,
  PackageBuilder,
  ProjectGraphNodeData,
  TypedProjectGraph,
  updatePackageJson,
  updateProject,
} from "../shared";
import { FormatGeneratorSchema } from "./schema";

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

function readProjectConfigurationWithBuilder(
  host: Tree,
  name: string,
  builder?: PackageBuilder | "auto"
) {
  const project = readProjectConfiguration(host, name) as ProjectConfig;
  builder = (builder && builder !== "auto" ? builder : project.builder) || "tsc";
  return Object.assign(project, { builder }) as ProjectGraphNodeData;
}

async function formatProject(host: Tree, options: FormatGeneratorSchema, graph: TypedProjectGraph) {
  const project = readProjectConfigurationWithBuilder(host, options.project, options.builder);
  const node = getLibraryFromGraph(graph, options.project)?.data;
  const { builder } = project;

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
        .filter((i) => i.node.type === "lib" && i.node.data.builder === "tsc")
        .map((dep) => {
          const file = dep.node.data.files.find((i) => /tsconfig\.json$/.test(i.file));
          return file && Path.relative(node.root, file.file).replace(/\\/g, "/");
        })
        .filter(Boolean);
      // console.log("tsconfig references:", tsconfigReferences);
      generateTscFiles(host, {
        name: options.project,
        projectRoot: project.root,
        references: tsconfigReferences.map((path) => (/^\./.test(path) ? path : "./" + path)),
      });
    }
    if (project.targets.build) {
      //   const buildOptions = project.targets.build.options || {};
      //   // 标准化outputs
      //   const outputs = [
      //     buildOptions.outputPath
      //       ? "{options.outputPath}"
      //       : buildOptions.cwd
      //       ? "{options.cwd}"
      //       : project.root,
      //   ];
      //   updateProjectConfiguration(host, options.project, {
      //     ...project,
      //     tags: node.tags,
      //     //@ts-ignore
      //     builder,
      //     targets: {
      //       ...project.targets,
      //       build: {
      //         ...project.targets.build,
      //         outputs,
      //       },
      //     },
      //   });
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

  updateProject(
    host,
    {
      name: options.project,
      packageManager: "pnpm",
      projectRoot: project.root,
      builder,
    },
    project
  );
}
function getLibraryFromGraph(graph: TypedProjectGraph, name: string) {
  const node = graph.nodes[name];
  if (node.type === "lib") return node;
  throw Error(`Project[${name}]不为Library!`);
}
