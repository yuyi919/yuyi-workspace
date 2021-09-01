import { ProjectGraph } from "@nrwl/workspace/src/core/project-graph";
import { ProjectNode } from "../../executors/build/getBuildablePackageJson";
import { ProjectType } from "@nrwl/workspace";
import { groupBy } from "lodash";
import { getSubType, LibraryType, SortedLibraryType } from "./LibraryType";
import { ProjectConfig } from "../../common/ProjectConfig";

export function getSortedProjects(
  projects: Record<string, ProjectConfig>,
  graph: ProjectGraph
): Record<string, ProjectConfig> {
  const sortedProjects = {};
  const group = groupBy(Object.keys(projects), (key) => {
    const { files, ...node } = (graph.nodes[key] as ProjectNode)?.data;
    const tags = node.nxJsonSection?.tags || node.tags || [];
    const libtypeIndex = SortedLibraryType.findIndex(
      (type) =>
        tags.includes(type) ||
        getSubType(type).some(
          (subType) => tags.includes(subType) || tags.includes(type + "-" + subType)
        )
    );
    const type = SortedLibraryType[libtypeIndex];
    console.log(key, type, tags);
    const subLibTypeIndex = getSubType(type).findIndex(
      (subType: string) => tags.includes(subType) || tags.includes(type + "-" + subType)
    );

    const libtype = SortedLibraryType[libtypeIndex];
    const projectType =
      projectTypeSort[
        libtype === LibraryType.Internal ? ProjectType.Library : projects[key].projectType
      ];
    return projectType + "|" + libtypeIndex + "|" + subLibTypeIndex;
  });
  const sortedProjectsKeys = []
  for (const key of Object.keys(group).sort()) {
    // console.log(key, group[key].sort());
    for (const name of group[key].sort()) {
      sortedProjectsKeys.push(name)
      sortedProjects[name] = projects[name];
    }
  }
  console.log("sortedWorkspaceJson", group);
  return sortedProjects;
}

export const projectTypeSort: Record<ProjectType, number> = [
  ProjectType.Application,
  ProjectType.Library,
].reduce((r, key, index) => ({ ...r, [key]: index }), {} as any);
