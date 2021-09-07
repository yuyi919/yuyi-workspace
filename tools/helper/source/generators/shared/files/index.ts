import { Rule } from "@angular-devkit/schematics";
import { generateFiles, Tree } from "@nrwl/devkit";
import { defaultsDeep } from "lodash";
import {
  addFiles,
  getOptions,
  MetaProject,
  resolveAbs,
  resolveFile,
} from "../../../common/addFiles";
import { TsConfigJson, updateTsConfigReference } from "../../../common/TsConfigJson";
import { tryReadJson, tryUpdateJson } from "../file-utils";

export function addTsdxFiles(normalizedOptions: MetaProject): Rule {
  return addFiles(resolveFile("./tsdx_files", __dirname), normalizedOptions);
}
export function addTscFiles(normalizedOptions: MetaProject): Rule {
  return addFiles(resolveFile("./tsc_files", __dirname), normalizedOptions);
}

export function generateTscFiles(host: Tree, { references, ...options }: MetaProject): void {
  const tsConfigPath = options.projectRoot + "/tsconfig.json";
  const source = tryReadJson(host, tsConfigPath) as TsConfigJson;
  generateFiles(host, resolveAbs("./tsc_files", __dirname), options.projectRoot, {
    tmpl: "",
    template: "",
    ...options,
    ...getOptions(options),
  });
  tryUpdateJson(host, tsConfigPath, (json: TsConfigJson) => {
    return updateTsConfigReference(defaultsDeep(json, source), references);
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
