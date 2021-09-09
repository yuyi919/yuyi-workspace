import { convertNxGenerator, Tree, normalizePath } from "@nrwl/devkit";
import { libraryGenerator as workspaceLibraryGenerator } from "@nrwl/workspace/generators";
import * as child_process from "child_process";
import { isEqual } from "lodash";
import { join } from "path";
import {
  formatFiles,
  formatWorkspacePackageJson,
  getProjectGraph,
  LibProjectNode,
  updateProject,
  updateRushJson,
  readProjectConfiguration,
  getProjectGraphWith,
} from "../shared";
import { createFiles } from "./createFiles";
import { convertOptionsToProjectNode, normalizeOptions, normalizeSchema } from "./normalizeSchema";
import { Schema } from "./schema";

export async function libraryGenerator(host: Tree, schema: Schema) {
  schema = normalizeSchema(host, schema);
  const options = normalizeOptions(host, schema);
  if (options.publishable === true && !options.importPath) {
    throw new Error(
      `For publishable libs you have to provide a proper "--importPath" which needs to be a valid npm package name (e.g. my-awesome-lib or @myorg/my-lib)`
    );
  }
  console.log(schema);

  try {
    // const nxWorkspaceCallback =
    await workspaceLibraryGenerator(host, {
      ...schema,
      importPath: options.importPath,
      testEnvironment: "node",
      skipFormat: true,
      skipTsConfig: true,
      skipBabelrc: true,
      unitTestRunner: "jest",
      setParserOptionsProject: false,
    });
  } catch (error) {}
  host.exists("jest.config.js") && host.delete("jest.config.js");
  host.exists("jest.preset.js") && host.delete("jest.preset.js");
  updateProject(host, options, readProjectConfiguration(host, options.name));

  const graph = getProjectGraphWith(host);
  // 添加正准备生成的lib的预测数据
  graph.nodes[options.name] = convertOptionsToProjectNode(options) as LibProjectNode;

  createFiles(host, options, graph);

  formatWorkspacePackageJson(host);

  updateRushJson(host, (json) => {
    // 全部分类
    const reviewCategories = json.approvedPackagesPolicy?.reviewCategories || [];
    const packages = {};
    for (const project of json.projects) {
      packages[project.packageName] = project;
    }
    const currentPackage = packages[options.importPath] || {
      packageName: options.importPath,
      projectFolder: normalizePath("packages/" + options.projectRoot),
      // 找到准确分类
      reviewCategory:
        reviewCategories.find((type) => options.parsedTags.includes(type)) || "production",
    };
    const changedCurrent = !isEqual(currentPackage, packages[options.importPath]);
    packages[options.importPath] = currentPackage;
    const sourceKeys = Object.keys(packages);
    const updateKeys = sourceKeys.sort();
    const sorted = !isEqual(sourceKeys, updateKeys);
    if (!changedCurrent && !sorted) {
      throw "rush.json has no changed";
    }
    json.projects = updateKeys.map((path) => packages[path]);
  });

  let callback: any;
  if (!schema.skipFormat) {
    callback = await formatFiles(host, graph);
  }
  return async () => {
    callback && (await callback());
    if (!schema.skipInstall) {
      child_process.execSync("rush update", {
        cwd: join(host.root, ".."),
        stdio: [0, 1, 2],
      });
    }
    // console.log(readJsonFile(join(host.root, "../rush.json")));
    // nxWorkspaceCallback && (await nxWorkspaceCallback());
  };
}
export const librarySchematic = convertNxGenerator(libraryGenerator);
export default libraryGenerator;
