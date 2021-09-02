import { convertNxGenerator, Tree, updateJson } from "@nrwl/devkit";
import { libraryGenerator as workspaceLibraryGenerator } from "@nrwl/workspace/generators";
import { createProjectGraph } from "@nrwl/workspace/src/core/project-graph";
import * as child_process from "child_process";
import { isEqual } from "lodash";
import { join } from "path";
import { PackageJSON } from "../../common/packageJsonUtils";
import { ProjectNode } from "../../executors/build/getBuildablePackageJson";
import { Schema } from "../../schematics/internal-nx-plugins-lerna/schema";
import { formatFiles } from "../format/format-files";
import { createFiles } from "./createFiles";
import { convertOptionsToProjectNode, normalizeOptions, normalizeSchema } from "./normalizeSchema";
import { updateRushJson } from "./rushUtils";
import { updateProject } from "./updateProject";

export async function libraryGenerator(host: Tree, schema: Schema) {
  schema = normalizeSchema(host, schema);
  const options = normalizeOptions(host, schema);
  if (options.publishable === true && !options.importPath) {
    throw new Error(
      `For publishable libs you have to provide a proper "--importPath" which needs to be a valid npm package name (e.g. my-awesome-lib or @myorg/my-lib)`
    );
  }
  console.log(options);

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
  host.exists("jest.config.js") && host.delete("jest.config.js");
  host.exists("jest.preset.js") && host.delete("jest.preset.js");
  updateProject(host, options);

  const graph = createProjectGraph();
  // 添加正准备生成的lib的预测数据
  graph.nodes[options.name] = convertOptionsToProjectNode(options) as ProjectNode;
  console.log(options.name, graph.nodes[options.name]);
  createFiles(host, options, graph);
  // if (options.js) {
  //   updateTsConfigsToJs(host, options);
  // }

  updateJson(host, "package.json", (pkg: PackageJSON) => {
    if (pkg.devDependencies) {
      if (pkg.dependencies) {
        for (const key in pkg.devDependencies) {
          if (key in pkg.dependencies) {
            delete pkg.devDependencies[key];
          }
        }
      }
      // 移除@types/jest, 因为不需要
      delete pkg.devDependencies["@types/jest"];
      // console.log(pkg);
    }
    return pkg;
  });

  updateRushJson(host, (json) => {
    // 全部分类
    const reviewCategories = json.approvedPackagesPolicy?.reviewCategories || [];
    const packages = {};
    for (const project of json.projects) {
      packages[project.packageName] = project;
    }
    const currentPackage = packages[options.importPath] || {
      packageName: options.importPath,
      projectFolder: ("packages/" + options.projectRoot).replace(/(\\)+/g, "/"),
      // 找到准确分类然后
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
    child_process.execSync("rush update", {
      cwd: join(host.root, ".."),
      stdio: [0, 1, 2],
    });
    // console.log(readJsonFile(join(host.root, "../rush.json")));
    // nxWorkspaceCallback && (await nxWorkspaceCallback());
  };
}
export const librarySchematic = convertNxGenerator(libraryGenerator);
export default libraryGenerator;
