//=============================================================================
// main.js v1.0.2
//=============================================================================
import { Main } from "@yuyi919/rpgmz-core";
import "./index.less";
import * as RMMZ from "./index";
import { System } from "./System";

for (const k of Object.keys(RMMZ)) {
  window[k] = RMMZ[k];
}

// @ts-ignore
window.System = System;
const main = new Main();
main.run();
