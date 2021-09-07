import {
  readProjectConfiguration as _readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from "@nrwl/devkit";
import { packageJson } from "../..";
import { appendCommand } from "../../common/appendCommand";
import { NormalizedOptions } from "../library/normalizeSchema";
import { LibProjectGraphNodeData } from "./graph";

export function updateProject(
  tree: Tree,
  options: Pick<NormalizedOptions, "projectRoot" | "name" | "packageManager" | "builder">,
  project: LibProjectGraphNodeData
) {
  project.targets = project.targets || {};
  project.targets.build = {
    executor: "@nrwl/workspace:run-commands",
    configurations: {
      watch: {
        commands: [`${options.packageManager} run build:watch`],
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
      format: `nx generate ${packageJson.name}:format --project=${options.name} --no-interactive`,
      remove: `nx generate @nrwl/workspace:remove --projectName=${options.name} --forceRemove`,
    },
    "."
  );

  updateProjectConfiguration(tree, options.name, project);
}
export function readProjectConfiguration(host: Tree, name: string) {
  return _readProjectConfiguration(host, name) as LibProjectGraphNodeData;
}
