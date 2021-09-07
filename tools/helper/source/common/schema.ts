import { NodeSchema } from "./node";

export type PackageBuilder = "tsdx" | "tsc" | "heft";
export interface CommonSchema extends NodeSchema {
  builder: PackageBuilder;
}
