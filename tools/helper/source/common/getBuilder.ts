import { readJsonSync } from "fs-extra";
import { join } from "path";
const { name } = readJsonSync(join(__dirname, "../../package.json"));
export enum InternalBuilder {
  CommonLib = "commonlib",
  VueLib = "vuelib",
  ReactLib = "reactlib",
}
export interface InternalBuilderName {
  [InternalBuilder.CommonLib]: "@yuyi-workspace/internal:commonlib";
  [InternalBuilder.VueLib]: "@yuyi-workspace/internal:vuelib";
  [InternalBuilder.ReactLib]: "@yuyi-workspace/internal:reactlib";
}
export interface BuilderOptionsCollection {
  [InternalBuilder.CommonLib]: any; //CommonBuilderOptions;
  [InternalBuilder.VueLib]: any; //VueLibBuilderOptions;
  [InternalBuilder.ReactLib]: any; //ReactLibBuilderOptions;
}
export type BuilderName<T extends unknown | InternalBuilder> = T extends InternalBuilder
  ? InternalBuilderName[T]
  : string;
export type BuilderOptions<T extends unknown | InternalBuilder> = T extends InternalBuilder
  ? BuilderOptionsCollection[T]
  : Record<string, any>;
export interface InternalBuilderTypeName {
  [InternalBuilder.CommonLib]: string;
  [InternalBuilder.VueLib]: string;
  [InternalBuilder.ReactLib]: string;
}
export function getBuilderName<T extends unknown | InternalBuilder>(
  builderName: T = InternalBuilder.CommonLib as any
): BuilderName<T> {
  return `${name}:${builderName}` as any;
}
