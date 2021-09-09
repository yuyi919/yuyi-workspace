import { chain, externalSchematic, Rule } from "@angular-devkit/schematics";
import { extendHost } from "./extendHost";
import { NodeSchema } from "./node";

export function withCommonLib(schema: NodeSchema): Rule {
  return extendHost(() => chain([externalSchematic("@nrwl/node", "library", schema)]));
}
import * as TsConfigJsonUtils from "./TsConfigJson";
export { TsConfigJsonUtils };
