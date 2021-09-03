import {
  getWorkspaceLayout,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from "@nrwl/devkit";
import { appendCommand } from "../../common/appendCommand";
import { NormalizedSchema } from "../../common/NormalizedSchema";

export function updateProject(tree: Tree, options: NormalizedSchema) {
  if (!options.publishable && !options.buildable) {
    return;
  }

  const project = readProjectConfiguration(tree, options.name);
  // const { libsDir } = getWorkspaceLayout(tree);
  
  project.targets = project.targets || {};
  project.targets.build = {
    executor: "@nrwl/workspace:run-commands",
    configurations: {
      watch: {
        commands: [`${options.packageManager} run build --watch`],
      },
    },
    options: {
      commands: [`${options.packageManager} run build`],
      cwd: options.projectRoot,
    },
    // executor: "@nrwl/node:package",
    // outputs: ["{options.outputPath}"],
    // options: {
    //   outputPath: `dist/${libsDir}/${options.projectDirectory}`,
    //   tsConfig: `${options.projectRoot}/tsconfig.lib.json`,
    //   packageJson: `${options.projectRoot}/package.json`,
    //   main: `${options.projectRoot}/src/index` + (options.js ? ".js" : ".ts"),
    //   assets: [`${options.projectRoot}/*.md`],
    // },
  };
  appendCommand(project, {
    remove: `nx generate @nrwl/workspace:remove --projectName=${options.name} --forceRemove`,
  });

  if (options.rootDir) {
    project.targets.build.options.srcRootForCompilationRoot = options.rootDir;
  }

  updateProjectConfiguration(tree, options.name, project);
}
