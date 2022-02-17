import "./index.less";
import * as RMMZ from "./index";
import { System } from "./System";
globalThis.System = System;

for (const k of Object.keys(RMMZ)) {
  globalThis[k] = RMMZ[k];
}
