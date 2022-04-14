import { RushConfiguration } from "@microsoft/rush-lib";
import {
  symlinkSync,
  ensureDirSync,
  removeSync,
  ensureFileSync,
  readJsonSync,
  writeJSONSync,
  writeFileSync
} from "fs-extra";
import { join } from "path";
import { loadRushPackages } from "./util";

const resolved = {
  "shared-": "@antv-plus2/helper-",
  "vue-antv-plus2-": "@antv-plus2/shared-plus2-",
  "vue-": "@antv-plus2/vue-",
  "workspace-base-rig": "@antv-plus2/workspace-"
};
export async function devPublish(): Promise<void> {
  const { path, generator } = loadRushPackages();
  const tempDir = join(path, "..", "./temp");
  const rushConfig = RushConfiguration.loadFromConfigurationFile(path);

  console.log(await loadProjects(rushConfig));
  async function loadProjects(rushConfig: RushConfiguration) {
    const packageJson = {
      name: "project-libs",
      version: "0.0.1",
      dependencies: {} as Record<string, any>,
      devDependencies: {} as Record<string, any>
    };
    for (const project of generator()) {
      const resolvedPrefix = Object.keys(resolved).find(
        (key) => project.packageName.split("/").pop().indexOf(key) === 0
      );
      if (resolvedPrefix) {
        const packageJsonPath = join(project.projectFolder, "package.json");
        const tsconfigPath = join(project.projectFolder, "tsconfig.json");
        const sourcePath = join(project.projectFolder, "src");

        const pkgName = project.packageName.split("/").pop();
        const [prefix, resolveName] = resolved[resolvedPrefix].split("/");
        const outSubDir = "src/" + pkgName.replace(resolvedPrefix, resolveName.replace(/-/g, "/"));
        const outDir = join(tempDir, prefix, outSubDir);
        const outSourceDir = join(outDir, "src");
        removeSync(outDir);
        ensureDirSync(outDir);
        symlinkSync(sourcePath, outSourceDir);

        const outputPackageName = project.packageName.replace(
          "@yuyi919/vue-antv-plus2-",
          "@antv-plus2/"
        );
        writeFileSync(
          join(outDir, "index.ts"),
          'export * from "./src";\r\nexport { default } from "./src";\r\n'
        );
        packageJson.dependencies[outputPackageName] = `file:./${outSubDir}`;
        const sourecJSON = readJsonSync(packageJsonPath);
        const outputPacakgeJson = join(outDir, "package.json");
        ensureFileSync(outputPacakgeJson);
        Object.assign(
          packageJson.devDependencies,
          filterDeps(sourecJSON.dependencies)
          // filterDeps(sourecJSON.devDependencies)
        );
        writeJSONSync(
          outputPacakgeJson,
          {
            name: outputPackageName,
            version: "0.0.1",
            main: "index.ts",
            module: "index.ts",
            types: "index.ts",
            dependencies: filterDeps(sourecJSON.dependencies)
            // devDependencies: filterDeps(sourecJSON.devDependencies),
          },
          { spaces: 2 }
        );
      }
    }
    console.log(packageJson);
    writeJSONSync(join(tempDir, "@antv-plus2/package.json"), packageJson, { spaces: 2 });
  }
}
function filterDeps(deps: any) {
  return Object.fromEntries(
    Object.entries(deps).filter(
      ([k, v]: any) =>
        !["vue-template-compiler", "vue", "ts-patch", "ts-import-plugin"].includes(k) &&
        k.indexOf("vite") === -1 &&
        !k.startsWith("@antv-plus2") &&
        !k.startsWith("@rushstack") &&
        !k.startsWith("@type-helper/vue") &&
        !k.startsWith("@microsoft") &&
        !k.startsWith("@types/heft") &&
        !k.startsWith("vue-demi") &&
        !v.startsWith("workspace:") &&
        !v.startsWith("workspace:")
    )
  );
}
