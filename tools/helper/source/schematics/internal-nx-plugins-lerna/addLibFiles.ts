import { Rule } from "@angular-devkit/schematics";
import {
  generateFiles,
  JsonParseOptions,
  JsonSerializeOptions,
  readJson,
  Tree,
  writeJson,
} from "@nrwl/devkit";
import { defaultsDeep, isEqual } from "lodash";
import { resolveFile, addFiles, getOptions, MetaProject, resolveAbs } from "../../common/addFiles";
import { TsConfigJson } from "../../common/TsConfigJson";

/**
 * Updates a JSON value to the file system tree
 *
 * @param host File system tree
 * @param path Path of JSON file in the Tree
 * @param updater Function that maps the current value of a JSON document to a new value to be written to the document
 * @param options Optional JSON Parse and Serialize Options
 */
export function tryUpdateJson<T extends object = any, U extends object = T>(
  host: Tree,
  path: string,
  updater: (value: T) => U,
  options?: JsonParseOptions & JsonSerializeOptions
) {
  const read = tryReadJson(host, path, options);
  if (read) {
    const updatedValue = updater(read);
    writeJson(host, path, updatedValue, options);
  }
}
export function tryRead(host: Tree, path: string) {
  return host.exists(path) && host.read(path).toString();
}
export function tryReadJson(
  host: Tree,
  path: string,
  options?: JsonParseOptions & JsonSerializeOptions
) {
  return host.exists(path) && readJson(host, path, options);
}
export function addTsdxFiles(normalizedOptions: MetaProject): Rule {
  return addFiles(resolveFile("./tsdx_files", __dirname), normalizedOptions);
}
export function addTscFiles(normalizedOptions: MetaProject): Rule {
  return addFiles(resolveFile("./tsc_files", __dirname), normalizedOptions);
}

export function generateTscFiles(host: Tree, { references, ...options }: MetaProject): void {
  const tsConfigPath = options.projectRoot + "/tsconfig.json";
  const source = tryReadJson(host, tsConfigPath);
  generateFiles(host, resolveAbs("./tsc_files", __dirname), options.projectRoot, {
    tmpl: "",
    template: "",
    ...options,
    ...getOptions(options),
  });
  tryUpdateJson(host, tsConfigPath, (json) => {
    const { references: sourceReferences = [], ...other } = defaultsDeep(
      json,
      source
    ) as TsConfigJson;
    const appendReferences = references.map((path) => ({ path }));
    return {
      ...other,
      references: [
        ...sourceReferences.filter((item) => !appendReferences.some((i) => isEqual(item, i))),
        ...appendReferences,
      ],
    };
  });
}

export function generateTsdxFiles(host: Tree, options: MetaProject): void {
  generateFiles(host, resolveAbs("./tsdx_files", __dirname), options.projectRoot, {
    tmpl: "",
    template: "",
    ...options,
    ...getOptions(options),
    references: options.references || [],
  });
}
