import { updateJsonInTree } from "@nrwl/workspace";
import { join } from "path";
import { NormalizedOptions } from "./NormalizedSchema";
export interface EslintConfig {
  extends: string;
  ignorePatterns: string[];
  [key: string]: any;
}
export function updateEslintConfigInTree(
  context: NormalizedOptions,
  callback: (json: EslintConfig) => EslintConfig
) {
  return updateJsonInTree(join(context.projectRoot, ".eslintrc.json"), callback);
}
export interface JestConfig {
  displayName: string,
  preset: string,
  globals: Record<string, any>,
  testEnvironment: "node" | "jsdom",
  transform: Record<string, string>,
  moduleFileExtensions: string[],
  coverageDirectory: string,
}
// export function updateJestConfigInTree(
//   context: NormalizedOptions,
//   callback: (json: Partial<JestConfig>) => Partial<JestConfig>
// ) {
//   return updateJsonInTree(join(context.projectRoot, "jest.config.js"), callback);
// }

export function updateRootEslintConfigInTree(callback: (json: EslintConfig) => EslintConfig) {
  return updateJsonInTree(".eslintrc", callback);
}
