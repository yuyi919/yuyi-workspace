import { chain } from "@angular-devkit/schematics";
import { updateJsonInTree } from "@nrwl/workspace";
import ts, { CompilerOptions } from "typescript";
import { dirname } from "path";
import { defaultsDeep, isEqual } from "lodash";
export interface TsConfigJson {
  extends: string;
  compilerOptions: CompilerOptions;
  references: TsConfigJsonReference[];
}
export interface TsConfigJsonReference {
  path: string;
  [key: string]: any;
}

export function getReferenceNormlized(target: TsConfigJsonReference) {
  target.path = (target.path as string).endsWith("/tsconfig.json")
    ? dirname(target.path)
    : target.path;
  return target;
}
export function isEqualReference(targetA: TsConfigJsonReference, targetB: TsConfigJsonReference) {
  return isEqual(getReferenceNormlized(targetA), getReferenceNormlized(targetB));
}

export function updateTsConfigReference(
  tsconfigJson: TsConfigJson,
  references: (string | TsConfigJsonReference)[] = []
) {
  const { references: sourceReferences = [], ...other } = tsconfigJson;
  const appendReferences = references.map((ref) => (typeof ref === "string" ? { path: ref } : ref));
  return {
    ...other,
    references: [
      ...sourceReferences.filter(
        (item) => !appendReferences.some((i) => isEqualReference(item, i))
      ),
      ...appendReferences,
    ],
  };
}

/**
 * 在生成流程中修改tsconfig文件
 * @param path 相对路径（以项目root目录为基准）
 * @param callback 变更回调
 */
export function updateTsConfigInTree(
  path: string,
  callback: (config: TsConfigJson, compilerOptions: CompilerOptions) => TsConfigJson | void
) {
  return updateJsonInTree(path, (config: TsConfigJson = {} as any) => {
    config = callback(config, config.compilerOptions || (config.compilerOptions = {})) || config;
    return config;
  });
}
/**
 * 在生成流程中修改项目根目录下的tsconfig.base.json文件
 * @param callback
 */
export function updateRootTsConfigInTree(
  callback: (config: TsConfigJson, compilerOptions: CompilerOptions) => TsConfigJson | void
) {
  let paths: ts.MapLike<string[]>;
  return chain([
    updateTsConfigInTree(`tsconfig.base.json`, (json, comp) => {
      json = callback(json, comp) || json;
      paths = json.compilerOptions.paths;
      json.compilerOptions.paths = Object.keys(paths || {})
        .sort()
        .reduce((json, path) => ({ ...json, [path]: paths[path] }), {});
      console.log(paths);
      return json;
    }),
    updateTsConfigInTree(`tsconfig.project.json`, (json, comp) => {
      if (paths) {
        comp.paths = Object.keys(paths).reduce(
          (result, key) => (
            paths[key] &&
              (result[key] = paths[key].map((path) =>
                path
                  .replace(/^libs/, "dist/libs")
                  .replace(/src([\\/])/, "")
                  .replace(/.ts$/, "")
              )),
            result
          ),
          {}
        );
      }
      return json;
    }),
  ]);
}
/**
 * 在生成流程中修改子项目下的tsconfig.lib.json文件
 * @param callback
 */
export function updateTsLibConfigInTree(
  projectRoot: string,
  callback: (config: TsConfigJson, compilerOptions: CompilerOptions) => TsConfigJson | void
) {
  return updateTsConfigInTree(`${projectRoot}/tsconfig.lib.json`, callback);
}
/**
 * 在生成流程中修改子项目下的tsconfig.lib.json文件
 * @param callback
 */
export function updateTsSpecConfigInTree(
  projectRoot: string,
  callback: (config: TsConfigJson, compilerOptions: CompilerOptions) => TsConfigJson | void
) {
  return updateTsConfigInTree(`${projectRoot}/tsconfig.spec.json`, callback);
}
/**
 * 在生成流程中修改子项目下的tsconfig.json文件
 * @param callback
 */
export function updateProjRootTsConfigInTree(
  projectRoot: string,
  callback: (config: TsConfigJson, compilerOptions: CompilerOptions) => TsConfigJson | void
) {
  return updateTsConfigInTree(`${projectRoot}/tsconfig.json`, callback);
}
