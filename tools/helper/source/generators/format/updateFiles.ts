import { Tree, normalizePath } from "@nrwl/devkit";
import { defaultsDeep } from "lodash";
import * as Path from "path";
import {
  formatDeps,
  TypedProjectGraph,
  updatePackageJson,
  updateProject,
  getLibraryFromGraph,
  generateFilesWith,
  PackageConfigFilesBuilder,
  PackageConfigures,
  getRushPackageDefinition,
} from "../shared";
import { readProjectConfigurationWithBuilder } from "./generator";
import { FormatGeneratorSchema } from "./schema";

export async function updateFiles(
  host: Tree,
  options: FormatGeneratorSchema,
  graph: TypedProjectGraph
) {
  const project = readProjectConfigurationWithBuilder(host, options.project, options.builder);
  const node = getLibraryFromGraph(graph, options.project)?.data;
  const { builder } = project;

  const configsBuilder = PackageConfigFilesBuilder.setup(
    host,
    options.project,
    PackageConfigures,
    graph
  );
  configsBuilder.setupUpdate(builder);
  configsBuilder.writeJson();

  // const {
  //   dependencies: deps,
  //   packageJson,
  //   packageJsonPath,
  // } = formatDeps(
  //   {
  //     workspaceRoot: host.root,
  //     projectName: options.project,
  //     // 如果该依赖项不为内部包，收集依赖
  //     match: (node, parent, deep) => deep < 1,
  //   },
  //   host,
  //   graph,
  //   true
  // );

  // updatePackageJson(host, packageJsonPath, () => {
  //   return defaultsDeep({
  //     ...packageJson,
  //     scripts: {
  //       ...packageJson.scripts,
  //       build: "heft build --clean",
  //       "build:watch": "heft build --watch",
  //       dev: "heft build --watch",
  //       test: "heft test",
  //       "test:watch": "heft test --watch",
  //     },
  //   });
  // });

  if (node?.projectType === "library") {
    console.log("builder:", builder);
    // if (builder === "tsc") {
    const tsconfigReferences = configsBuilder.dependencyNodes
      .filter((i) => i.node.type === "lib" && i.node.data.builder === "tsc")
      .map((dep) => {
        const file = dep.node.data.files.find((i) => /tsconfig\.json$/.test(i.file));
        return file && normalizePath(Path.relative(node.root, Path.dirname(file.file)));
      })
      .filter(Boolean);
    // console.log("tsconfig references:", tsconfigReferences);
    generateFilesWith(host, {
      name: options.project,
      projectRoot: project.root,
      builder,
      references: tsconfigReferences.map((path) => (/^\./.test(path) ? path : "./" + path)),
    });
    // }
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
