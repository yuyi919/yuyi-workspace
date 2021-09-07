import { Tree } from "@nrwl/devkit";
import { join } from "path";
import {
  generateFilesWith,
  updatePackageJson,
  formatDeps,
  TypedProjectGraph,
  tryDelete,
  PackageConfigFilesBuilder,
  PackageConfigures,
} from "../shared";
import { NormalizedOptions } from "./normalizeSchema";

export function createFiles(host: Tree, options: NormalizedOptions, projGraph: TypedProjectGraph) {
  if (options.builder === "heft-tsc") {
    tryDelete(host, join(options.projectRoot + "/tsconfig.lib.json"));
    tryDelete(host, join(options.projectRoot + "/tsconfig.spec.json"));
  }
  generateFilesWith(host, {
    name: options.name,
    projectRoot: options.projectRoot,
    builder: options.builder,
  });
  const configsBuilder = PackageConfigFilesBuilder.setup(host, options.name, PackageConfigures, projGraph);
  configsBuilder.setupInit(options.builder);
  configsBuilder.writeJson(options.publishable);

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
