import {
  FileData,
  ProjectGraph,
  ProjectGraphNode,
  ProjectType,
  readJson,
  Tree,
} from "@nrwl/devkit";
import { FsTree } from "@nrwl/tao/src/shared/tree";
import { appRootPath } from "@nrwl/tao/src/utils/app-root";
import {
  allFilesInDir,
  readFileIfExisting,
  rootWorkspaceFileData,
  workspaceLayout,
} from "@nrwl/workspace/src/core/file-utils";
import { defaultFileHasher } from "@nrwl/workspace/src/core/hasher/file-hasher";
import { createProjectGraph } from "@nrwl/workspace/src/core/project-graph";
import ignore from "ignore";
import { extname, relative, sep } from "path";
import { performance } from "perf_hooks";
import type { PackageBuilder } from ".";

export function readWorkspaceFilesWith(appRootPath: string): FileData[] {
  function getIgnoredGlobs() {
    const ig = ignore();
    ig.add(readFileIfExisting(`${appRootPath}/.gitignore`));
    ig.add(readFileIfExisting(`${appRootPath}/.nxignore`));
    return ig;
  }
  function getFileData(filePath) {
    const file = relative(appRootPath, filePath).split(sep).join("/");
    return {
      file,
      hash: defaultFileHasher.hashFile(filePath),
      ext: extname(filePath),
    };
  }
  performance.mark("read workspace files:start");

  if (defaultFileHasher.usesGitForHashing) {
    const ignoredGlobs = getIgnoredGlobs();
    const r = defaultFileHasher.workspaceFiles
      .filter((f) => !ignoredGlobs.ignores(f))
      .map((f) => getFileData(`${appRootPath}/${f}`));
    performance.mark("read workspace files:end");
    performance.measure(
      "read workspace files",
      "read workspace files:start",
      "read workspace files:end"
    );
    r.sort((x, y) => x.file.localeCompare(y.file));
    return r;
  } else {
    const r = [];
    r.push(...rootWorkspaceFileData());

    // Add known workspace files and directories
    r.push(...allFilesInDir(appRootPath, false));
    r.push(...allFilesInDir(`${appRootPath}/tools`));
    const wl = workspaceLayout();
    r.push(...allFilesInDir(`${appRootPath}/${wl.appsDir}`));
    if (wl.appsDir !== wl.libsDir) {
      r.push(...allFilesInDir(`${appRootPath}/${wl.libsDir}`));
    }
    performance.mark("read workspace files:end");
    performance.measure(
      "read workspace files",
      "read workspace files:start",
      "read workspace files:end"
    );
    r.sort((x, y) => x.file.localeCompare(y.file));
    return r;
  }
}

export function getProjectGraph<T = {}>() {
  return getProjectGraphWith<T>();
}

export function getProjectGraphWith<T = {}>(host: Tree | string = appRootPath) {
  host = typeof host === "string" ? new FsTree(host, false) : host;
  const worksapce = readJson(host, "workspace.json");
  const nx = readJson(host, "nx.json");
  const graph = createProjectGraph(worksapce, nx, readWorkspaceFilesWith(host.root));
  return graph as TypedProjectGraph<T>;
}

/**
 * 修复DependentBuildableProjectNode定义
 * ```ts
 * import { DependentBuildableProjectNode } from "@nrwl/workspace/src/utils/buildable-libs-utils";
 * ```
 */
export type DependentBuildableProjectNode = {
  name: string;
  outputs: string[];
  node: TypedProjectGraphNode | NpmProjectNode;
};

export type TypedProjectGraph<T = {}> = Omit<ProjectGraph, "nodes"> & {
  nodes: Record<string, TypedProjectGraphNode<T>>;
};

export type LibProjectGraphNodeData = {
  root: string;
  sourceRoot?: string;
  projectType: ProjectType;
  tags: string[];
  targets: {
    [K: string]: any;
  };
  builder?: PackageBuilder;
  nxJsonSection?: { tags?: string[] };
};
export type NpmProjectGraphNodeData = {
  packageName: string;
  version: string;
};
export type LibProjectNode<T = {}> = ProjectGraphNode<LibProjectGraphNodeData & T> & {
  type: "lib";
};
export type NpmProjectNode<T = {}> = ProjectGraphNode<NpmProjectGraphNodeData & T> & {
  type: "npm";
};
export type TypedProjectGraphNode<T = {}> = LibProjectNode<T> | NpmProjectNode<T>;

export function getLibraryFromGraph(graph: TypedProjectGraph, name: string) {
  const node = graph.nodes[name];
  if (node?.type === "lib") return node;
  throw Error(`Project[${name}]不为Library!`);
}
