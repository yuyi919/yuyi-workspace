import { chain, Rule } from "@angular-devkit/schematics";
import { addDepsToPackageJson, updateJsonInTree, updateWorkspaceInTree } from "@nrwl/workspace";
import { join } from "path";
import { TsConfigJsonUtils, withCommonLib } from "../../common";
import { appendCommand } from "../../common/appendCommand";
import { extendHost } from "../../common/extendHost";
// import { moveInTree } from '../../common/moveInTree';
import { NormalizedSchema, normalizeOptions, preOptions } from "../../common/NormalizedSchema";
import { assignPackageJson } from "../../common/packageJsonUtils";
import { WorkspaceJson } from "../../common/ProjectConfig";
import { updateEslintConfigInTree } from "../../common/updateEslintConfig";
import { addTscFiles, addTsdxFiles } from "./addLibFiles";
import { Schema } from "./schema";
import "./schema.json";

export default function (options: Schema): Rule {
  return extendHost((host) => {
    options = preOptions(options, host);
    console.log(options);
    options.tags = options.tags ? "lerna-package," + options.tags : "lerna-package";
    const normalizedOptions = normalizeOptions(host, options);
    normalizedOptions.keywords = normalizedOptions.keywords.filter((i) => i !== "lerna-package");
    console.log(normalizedOptions);
    const cleanTsConfig = updateJsonInTree(
      `tsconfig.base.json`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({ compilerOptions = {}, ...json } = {} as any) => {
        const path = normalizedOptions.importPath || normalizedOptions.name;
        if (compilerOptions && compilerOptions.paths && compilerOptions.paths[path]) {
          delete compilerOptions.paths[path];
          delete compilerOptions.paths[path + "/*"];
        }
        return {
          ...json,
          compilerOptions,
        };
      }
    );
    console.log(normalizedOptions.builder);
    return chain([
      // addFiles('./files', normalizedOptions),
      cleanTsConfig,
      withCommonLib(options),
      updateEslintConfigInTree(normalizedOptions, (json) => ({
        ...json,
        extends: "./node_modules/@yuyi919/workspace-base-rig/.eslintrc.json",
        ignorePatterns: (json.ignorePatterns || []).filter((i) => i !== "!**/*"),
      })),
      updateWorkspaceInTree((json: WorkspaceJson) => {
        const { projects } = json;
        // const finalHooks: (Plugin['updateWorkspaceJson'] & { name: string; })[] = []
        // projects = getSortedProjects(projects)
        const project = projects[normalizedOptions.name];
        projects[normalizedOptions.name] = appendCommand(project, {
          remove: `nx generate @nrwl/workspace:remove --projectName=${normalizedOptions.name} --forceRemove`,
        });
        project.targets["build"] = {
          builder: "@nrwl/workspace:run-commands",
          configurations: {
            watch: {
              commands: [`${normalizedOptions.packageManager} run build --watch`],
            },
          },
          options: {
            commands: [`${normalizedOptions.packageManager} run build`],
            cwd: normalizedOptions.projectRoot,
          },
        };
        // console.log(projects[normalizedOptions.name])
        return { ...json, projects };
      }),
      (normalizedOptions.builder === "tsc" ? buildWithTsc : buildWithTSDX)(normalizedOptions),
      cleanTsConfig,
      // moveInTree({
      //   "tsconfig.json": "tsconfig.lib.json"
      // }, normalizedOptions.projectRoot),
      // moveInTree({
      //   "tsconfig.lib.json": "tsconfig.json"
      // }, normalizedOptions.projectRoot),
      // updateWorkspace((workspace) => {
      //   workspace.projects
      //     .add({
      //       name: normalizedOptions.projectName,
      //       root: normalizedOptions.projectRoot,
      //       sourceRoot: `${normalizedOptions.projectRoot}/src`,
      //       projectType,
      //     })
      //     .targets.add({
      //       name: 'build',
      //       builder: '@yuyi919/internal-nx-plugins-lerna:build',
      //     });
      // }),
      // addProjectToNxJsonInTree(normalizedOptions.projectName, {
      //   tags: normalizedOptions.parsedTags,
      // }),
      // addFiles(normalizedOptions),
    ]);
  });
}
function buildWithTsc(normalizedOptions: NormalizedSchema): Rule {
  return chain([
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (tree, context) => {
      tree.delete(normalizedOptions.projectRoot + "/tsconfig.lib.json");
      // tree.delete(normalizedOptions.projectRoot + "/tsconfig.spec.json");
    },
    addTscFiles(normalizedOptions),
    TsConfigJsonUtils.updateProjRootTsConfigInTree(normalizedOptions.projectRoot, (json) => {
      return {
        extends: json.extends,
        compilerOptions: {
          rootDir: "./src",
          declaration: true,
        },
        exclude: [],
        include: [],
        references: [{ path: "./tsconfig.cjs.json" }, { path: "./tsconfig.lib.json" }],
      } as any;
    }),
    assignPackageJson(normalizedOptions, {
      keywords: normalizedOptions.keywords,
      main: "dist/index.js",
      module: "lib/index.js",
      types: "dist/index.d.ts",
      scripts: {
        build: "tsc --build --force",
        dev: "tsc --build --watch",
        clean: `rimraf ../.tsBuildInfo/${normalizedOptions.name}*.json && rimraf ./dist && rimraf ./lib`,
      },
      sideEffect: false,
      license: "MIT",
      publishConfig: {
        access: "public",
      },
      files: ["dist", "lib", "README.md"],
    }),
  ]);
}

function buildWithTSDX(normalizedOptions: NormalizedSchema): Rule {
  return chain([
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (tree, context) => {
      tree.delete(normalizedOptions.projectRoot + "/tsconfig.lib.json");
      // tree.delete(normalizedOptions.projectRoot + "/tsconfig.spec.json");
    },
    addTsdxFiles(normalizedOptions),
    TsConfigJsonUtils.updateProjRootTsConfigInTree(normalizedOptions.projectRoot, (json) => {
      return {
        extends: json.extends,
        compilerOptions: {
          outDir: "./dist",
          rootDir: "./src",
          emitDeclarationOnly: true,
          tsBuildInfoFile: `../.tsBuildInfo/${normalizedOptions.name}.json`,
        },
        exclude: ["**/*.spec.ts"],
        include: ["src/**/*.ts"],
        // references: [],
      } as any;
    }),
    assignPackageJson(normalizedOptions, {
      keywords: normalizedOptions.keywords,
      main: "dist/index.js",
      module: `dist/${normalizedOptions.name.split("-").pop()}.esm.js`,
      types: "dist/index.d.ts",
      scripts: {
        build: `tsdx build && ${normalizedOptions.packageManager} run types`,
        dev: `tsdx watch --transpileOnly --onSuccess "${normalizedOptions.packageManager} run types"`,
        types: "tsc --build --force",
      },
      sideEffect: false,
      license: "MIT",
      publishConfig: {
        access: "public",
      },
      files: ["dist", "README.md"],
    }),
  ]);
}
