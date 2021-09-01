import {
  getWorkspaceLayout,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from "@nrwl/devkit";
import { NormalizedSchema } from "../../common/NormalizedSchema";

export function updateProject(tree: Tree, options: NormalizedSchema) {
  if (!options.publishable && !options.buildable) {
    return;
  }

  const project = readProjectConfiguration(tree, options.name);
  const { libsDir } = getWorkspaceLayout(tree);

  project.targets = project.targets || {};
  project.targets.build = {
    executor: "@nrwl/node:package",
    outputs: ["{options.outputPath}"],
    options: {
      outputPath: `dist/${libsDir}/${options.projectDirectory}`,
      tsConfig: `${options.projectRoot}/tsconfig.lib.json`,
      packageJson: `${options.projectRoot}/package.json`,
      main: `${options.projectRoot}/src/index` + (options.js ? ".js" : ".ts"),
      assets: [`${options.projectRoot}/*.md`],
    },
  };

  if (options.rootDir) {
    project.targets.build.options.srcRootForCompilationRoot = options.rootDir;
  }

  updateProjectConfiguration(tree, options.name, project);
}
