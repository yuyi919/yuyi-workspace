import { NodeSchema } from "./node";

export type PackageBuilder = "tsdx" | "tsc" | "heft-tsc";
export interface CommonSchema extends NodeSchema {
  builder: PackageBuilder;
}
