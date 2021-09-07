import { getWorkspacePath, ProjectGraph, readJson, writeJson } from "@nrwl/devkit";
import type { Tree } from "@nrwl/tao/src/shared/tree";
import { reformattedWorkspaceJsonOrNull } from "@nrwl/tao/src/shared/workspace";
import { sortObjectByKeys } from "@nrwl/tao/src/utils/object-sort";
import * as path from "path";
import type * as Prettier from "prettier";
import { WorkspaceJson } from "../../common/ProjectConfig";
import { getSortedProjects } from "./getSortedProjects";
import { TypedProjectGraph } from "./graph";

/**
 * Formats all the created or updated files using Prettier
 * @param host - the file system tree
 */
export async function formatFiles(host: Tree, graph?: TypedProjectGraph) {
  let prettier: typeof Prettier;
  try {
    prettier = require("prettier");
    // eslint-disable-next-line no-empty
  } catch (e) {
    console.error(e);
  }

  updateWorkspaceJsonToMatchFormatVersion(host);
  graph && sortWorkspaceJson(host, graph);
  sortNxJson(host);
  sortTsConfig(host);

  if (!prettier) return;

  const files = new Set(host.listChanges().filter((file) => file.type !== "DELETE"));
  let callback: Function;
  await Promise.all(
    Array.from(files).map(async (file) => {
      const systemPath = path.join(host.root, file.path);
      let options: Prettier.Options = {
        filepath: systemPath,
      };
      const resolvedOptions = await prettier.resolveConfig(systemPath);
      if (!resolvedOptions) {
        return;
      }
      options = {
        ...options,
        ...resolvedOptions,
      };

      const support = await prettier.getFileInfo(systemPath);
      if (support.ignored || !support.inferredParser) {
        // console.log(support.ignored, !support.inferredParser, systemPath);
        return;
      }

      try {
        if (host.exists(file.path)) {
          // console.log(file.path);
          const r = prettier.format(file.content.toString("utf-8"), options);
          host.write(file.path, r);
        }
      } catch (e) {
        console.warn(`Could not format ${file.path}. Error: "${e.message}"`);
      }
    })
  );
  return callback;
}

function updateWorkspaceJsonToMatchFormatVersion(host: Tree) {
  const path = getWorkspacePath(host);
  if (!path) {
    return;
  }

  try {
    const workspaceJson = readJson(host, path);
    // console.log(workspaceJson)
    const reformatted = reformattedWorkspaceJsonOrNull(workspaceJson);
    if (reformatted) {
      writeJson(host, path, reformatted);
    }
  } catch (e) {
    console.error(`Failed to format: ${path}`);
    console.error(e);
  }
}

export function updateWorkspace(host: Tree, callback: (json: WorkspaceJson) => WorkspaceJson) {
  const jsonPath = getWorkspacePath(host);
  if (!jsonPath) {
    return;
  }
  try {
    const workspaceJson: WorkspaceJson = readJson(host, jsonPath);
    writeJson(host, jsonPath, callback(workspaceJson));
  } catch (e) {
    console.error(e);
    // catch noop
  }
}
function sortWorkspaceJson(host: Tree, graph: TypedProjectGraph) {
  updateWorkspace(host, (workspaceJson) => {
    return {
      ...workspaceJson,
      projects: getSortedProjects(workspaceJson.projects, graph),
    };
  });
  // const workspaceJson = readJson(host, workspaceJsonPath);
  // if (Object.entries(workspaceJson.projects).length !== 0) {
  //   const sortedProjects = sortObjectByKeys(workspaceJson.projects);
  //   writeJson(host, workspaceJsonPath, {
  //     ...workspaceJson,
  //     projects: sortedProjects,
  //   });
  // }
}

function sortNxJson(host: Tree) {
  try {
    const nxJson = readJson(host, "nx.json");
    const sortedProjects = sortObjectByKeys(nxJson.projects);
    writeJson(host, "nx.json", {
      ...nxJson,
      projects: sortedProjects,
    });
  } catch (e) {
    // catch noop
  }
}

function sortTsConfig(host: Tree) {
  try {
    const tsconfig = readJson(host, "tsconfig.base.json");
    const sortedPaths = sortObjectByKeys(tsconfig.compilerOptions.paths);
    writeJson(host, "tsconfig.base.json", {
      ...tsconfig,
      compilerOptions: {
        ...tsconfig.compilerOptions,
        paths: sortedPaths,
      },
    });
  } catch (e) {
    // catch noop
  }
}
