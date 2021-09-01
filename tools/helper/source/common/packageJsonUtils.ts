import { updateJsonInTree } from "@nrwl/workspace";
import { merge } from "lodash";
import { NormalizedOptions } from "./NormalizedSchema";

export type PackageJSON = {
  name?: string;
  description: string;
  sideEffect?: boolean;
  main: string;
  scripts: Record<string, string>;
  devDependencies: Record<string, string>;
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  [key: string]: unknown;
};
export function modifyLibPackageJson(
  options: NormalizedOptions,
  callback: (json: PackageJSON) => PackageJSON | void
) {
  return updateJsonInTree(`${options.projectRoot}/package.json`, (json: PackageJSON) => {
    json = callback(json) || json;
    return json;
  });
}

export function assignPackageJson(options: NormalizedOptions, optJson: Partial<PackageJSON>) {
  return modifyLibPackageJson(options, (json) => {
    return merge({}, json, optJson);
  });
}
