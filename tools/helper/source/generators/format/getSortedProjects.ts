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
  return sortObjectKeysWith(projects, (key) => {
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
    return [projectType, libtypeIndex, subLibTypeIndex];
  });
}
export function sortObjectKeysWith<O extends Record<string, any>, K extends keyof O, R extends number | string | (number | string)[]>(
  collection: O,
  walkerCast: (key: K) => R
): O {
  const sortedProjects = {} as O;
  const group = groupBy(Object.keys(collection), (key: K) => {
    const lib = walkerCast(key);
    return lib instanceof Array ? lib.join("|") : lib;
  }) as Record<string, string[]>;
  const sortedProjectsKeys = [];
  let comp = (a, b) => (a == b ? a.localeCompare(b) : a - b);
  for (const key of Object.keys(group).sort(comp)) {
    // console.log(key, group[key].sort());
    for (const name of group[key].sort()) {
      sortedProjectsKeys.push(name);
      sortedProjects[name as keyof O] = collection[name];
    }
  }
  console.log(group, sortedProjectsKeys);
  return sortedProjects;
}

export const projectTypeSort: Record<ProjectType, number> = [
  ProjectType.Application,
  ProjectType.Library,
].reduce((r, key, index) => ({ ...r, [key]: index }), {} as any);
