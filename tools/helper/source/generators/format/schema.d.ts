import { PackageBuilder } from "../shared";

export interface FormatGeneratorSchema {
  project: string;
  builder: PackageBuilder | "auto";
  all: boolean;
}
