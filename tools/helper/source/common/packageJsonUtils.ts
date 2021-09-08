import { updateJsonInTree } from "@nrwl/workspace";
import { IPackageJson } from "@rushstack/node-core-library";
import { merge } from "lodash";
import { NormalizedOptions } from "./NormalizedSchema";

export interface PackageJSON extends IPackageJson {
  // name?: string;
  // private?: boolean;
  // description: string;
  sideEffect?: boolean;
  // main: string;
  // module?: string;
  // license?: string;
  // types?: string;
  // scripts: Record<string, string>;
  // devDependencies: Record<string, string>;
  // dependencies: Record<string, string>;
  // peerDependencies: Record<string, string>;
  files?: string[];
  module?: string;
  keywords?: string[]
  publishConfig?: {
    access?: string
  }
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
