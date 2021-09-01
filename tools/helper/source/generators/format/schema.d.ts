import { PackageBuilder } from "../../schematics/internal-nx-plugins-lerna/schema";

export interface FormatGeneratorSchema {
  project: string;
  builder: PackageBuilder;
}
