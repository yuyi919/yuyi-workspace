import {
  readProjectConfiguration,
  updateProjectConfiguration,
  Tree,
  readJson,
  writeJson,
  names,
} from "@nrwl/devkit";
import { createProjectGraph } from "@nrwl/workspace/src/core/project-graph";
import * as Path from "path";
import { formatDeps } from "../../executors/build/updateDeps";
import { ProjectNode } from "../../executors/build/getBuildablePackageJson";
import { generateTscFiles } from "../../schematics/internal-nx-plugins-lerna/addLibFiles";
import { PackageBuilder } from "../../schematics/internal-nx-plugins-lerna/schema";
import { FormatGeneratorSchema } from "./schema";
import { formatFiles } from "./format-files";
import { PackageJSON } from "../../common/packageJsonUtils";

export async function updatePackageJson(
  host: Tree,
  jsonPath: string,
  callback: (json: PackageJSON) => PackageJSON
) {
  const workspaceJson: PackageJSON = await readJson(host, jsonPath);
  writeJson(host, jsonPath, callback(workspaceJson));
}
export default async function (host: Tree, options: FormatGeneratorSchema) {
  const project = Object.assign(
    { builder: "auto" as PackageBuilder },
    readProjectConfiguration(host, options.project)
  );

  const graph = createProjectGraph();
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
    match: (node, parent, deep) => deep < 1, // || !node.data.tags?.includes('internal')
  });

  writeJson(host, packageJsonPath, {
    ...packageJson,
    scripts: {
      ...packageJson.scripts,
      build: "heft build --clean",
      dev: "heft build --watch",
      test: "heft test",
      "test:watch": "heft test --watch",
      "nx:format": `nx run ${options.project}:format`,
    }
  });
  if (node && node.projectType === "library" && node.tags?.includes("lerna-package")) {
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
        references: tsconfigReferences.map((path) => (/^\./.test(path) ? path : "./" + path)),
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
  // await updateWorkspace(host, (workspaceJson) => {
  //   return {
  //     ...workspaceJson,
  //     projects: getSortedProjects(workspaceJson.projects, graph),
  //   };
  // });
  return await formatFiles(host, graph);
}
