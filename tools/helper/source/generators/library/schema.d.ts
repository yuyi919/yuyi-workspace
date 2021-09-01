import { CommonSchema } from "../../common/schema";

export type PackageBuilder = "tsdx" | "tsc" | "auto";
export interface Schema extends CommonSchema {
  builder: PackageBuilder;
}
