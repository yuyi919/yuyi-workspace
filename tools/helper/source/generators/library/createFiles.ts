import { ProjectGraph, names, Tree, writeJson } from "@nrwl/devkit";
import { join } from "path";
import { NormalizedSchema } from "../../common/NormalizedSchema";
import { createDeps } from "../../executors/build/updateDeps";
import { generateTscFiles } from "../../schematics/internal-nx-plugins-lerna/addLibFiles";

export function createFiles(tree: Tree, options: NormalizedSchema, projGraph?: ProjectGraph) {
  // generateTscFiles(tree, {
  // })
  const { packageJson, packageJsonPath } = createDeps(
    {
      workspaceRoot: tree.root,
      projectDir: options.projectRoot,
      // 如果该依赖项不为内部包，收集依赖
      // match: (node, parent, deep) => deep < 1, // || !node.data.tags?.includes('internal')
    },
    tree,
    projGraph
  );
  const nameFormats = names(options.fileName);
  // generateFiles(tree, join(__dirname, "./files/lib"), options.projectRoot, {
  //   ...options,
  //   ...nameFormats,
  //   tmpl: "",
  //   offsetFromRoot: offsetFromRoot(options.projectRoot),
  // });
  generateTscFiles(tree, {
    name: options.name,
    projectRoot: options.projectRoot,
  });
  
  writeJson(tree, packageJsonPath, {
    ...packageJson,
    scripts: {
      ...packageJson.scripts,
      build: "heft build --clean",
      "build:dev": "heft build",
      dev: "heft build --watch",
      test: "heft test",
      "test:watch": "heft test --watch",
    },
    main: "dist/index.js",
    module: "lib/index.js",
    types: "dist/index.d.ts",
    publishConfig: {
      access: "public",
    },
    files: ["dist", "lib", "README.md"],
  });

  const tslibJson = join(options.projectRoot + "/tsconfig.lib.json");
  tree.exists(tslibJson) && tree.delete(tslibJson);
  // if (options.unitTestRunner === "none") {
  // const specFile = join(options.projectRoot, `./src/lib/${nameFormats.fileName}.spec.ts`);
  // tree.exists(specFile) && tree.delete(specFile);
  // }
  // if (!options.publishable && !options.buildable) {
  //   tree.delete(join(options.projectRoot, "package.json"));
  // }
  // if (options.js) {
  //   toJS(tree);
  // }
}
