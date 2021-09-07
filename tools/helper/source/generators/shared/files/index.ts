import { convertNxGenerator, generateFiles, Tree } from "@nrwl/devkit";
import { defaultsDeep } from "lodash";
import { getOptions, MetaProject, resolveAbs } from "../../../common/addFiles";
import { PackageBuilder } from "../../../common/schema";
import { TsConfigJson, updateTsConfigReference } from "../../../common/TsConfigJson";
import { tryReadJson, tryUpdateJson } from "../file-utils";

export function generateFilesWith(
  host: Tree,
  { references, builder, ...options }: MetaProject & { builder: PackageBuilder }
): void {
  const tsConfigPath = options.projectRoot + "/tsconfig.json";
  const source = builder === "tsc" && (tryReadJson(host, tsConfigPath) as TsConfigJson);
  generateFiles(host, resolveAbs("./" + builder, __dirname), options.projectRoot, {
    tmpl: "",
    template: "",
    ...options,
    ...getOptions(options),
    references
  });
  
  builder === "tsc" &&
    tryUpdateJson(host, tsConfigPath, (json: TsConfigJson) => {
      return updateTsConfigReference(defaultsDeep(json, source), references);
    });
}
export function generateTscFiles(host: Tree, options: MetaProject): void {
  const { references, ...other } = options
  const tsConfigPath = options.projectRoot + "/tsconfig.json";
  const source = tryReadJson(host, tsConfigPath) as TsConfigJson;
  generateFiles(host, resolveAbs("./tsc", __dirname), options.projectRoot, {
    tmpl: "",
    template: "",
    ...options,
    ...getOptions(other),
    references
  });
  tryUpdateJson(host, tsConfigPath, (json: TsConfigJson) => {
    return updateTsConfigReference(defaultsDeep(json, source), references);
  });
}

export function generateTsdxFiles(host: Tree, options: MetaProject): void {
  generateFiles(host, resolveAbs("./tsdx", __dirname), options.projectRoot, {
    tmpl: "",
    template: "",
    ...options,
    ...getOptions(options),
    references: options.references || [],
  });
}

export const addTscFiles = convertNxGenerator(generateTscFiles);
export const addTsdxFiles = convertNxGenerator(generateTsdxFiles);
