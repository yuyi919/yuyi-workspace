import { Tree } from "@nrwl/devkit";
import { join } from "path";
import {
  generateFilesWith,
  updatePackageJson,
  formatDeps,
  TypedProjectGraph,
  tryDelete,
  PackageJsonBuilder,
  PackageConfigures,
} from "../shared";
import { NormalizedOptions } from "./normalizeSchema";

export function createFiles(host: Tree, options: NormalizedOptions, projGraph: TypedProjectGraph) {
  generateFilesWith(host, {
    name: options.name,
    projectRoot: options.projectRoot,
    builder: options.builder,
  });
  const packageJsonBuilder = PackageJsonBuilder.setup(host, options.name, PackageConfigures, projGraph);
  packageJsonBuilder.setupInit(options.builder);
  packageJsonBuilder.writeJson(options.publishable);

  if (options.builder === "heft-tsc") {
    tryDelete(host, join(options.projectRoot + "/tsconfig.lib.json"));
    tryDelete(host, join(options.projectRoot + "/tsconfig.spec.json"));
  }
  // if (options.unitTestRunner === "none") {
  // const specFile = join(options.projectRoot, `./src/lib/${nameFormats.fileName}.spec.ts`);
  // tree.exists(specFile) && tree.delete(specFile);
  // }
  // if (!options.publishable) {
  //   // tree.delete(join(options.projectRoot, "package.json"));
  // }
  // if (options.js) {
  //   toJS(tree);
  // }
}
