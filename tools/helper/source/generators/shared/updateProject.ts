import { readProjectConfiguration, Tree, updateProjectConfiguration } from "@nrwl/devkit";
import { appendCommand } from "../../common/appendCommand";
import { NormalizedOptions } from "../library/normalizeSchema";

export function updateProject(
  tree: Tree,
  options: Pick<NormalizedOptions, "projectRoot" | "name" | "packageManager" | "builder">,
  project = readProjectConfiguration(tree, options.name)
) {
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
  };

  appendCommand(
    project,
    {
      format: `nx generate ${`@yuyi919/nx-plugin-workspace-helper`}:format --project=${
        options.name
      } --no-interactive`,
      remove: `nx generate @nrwl/workspace:remove --projectName=${options.name} --forceRemove`,
    },
    "."
  );

  updateProjectConfiguration(tree, options.name, project);
}
