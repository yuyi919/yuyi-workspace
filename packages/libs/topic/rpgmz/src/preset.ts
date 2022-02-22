import "./index.less";
import * as RMMZ from "./index";
import * as PIXI from "pixi.js";
import { System } from "./lib/System";

globalThis.System = System;
globalThis.PIXI = PIXI;

System.register("@yuyi919/rpgmz-core", [], () => ({
  execute() {
    const exports = {
      default: globalThis
    };
    // eslint-disable-next-line guard-for-in
    for (const key in RMMZ) {
      Object.defineProperty(exports, key, {
        get() {
          return globalThis[key];
        }
      });
      Object.defineProperty(exports, "default", {
        get() {
          return globalThis;
        }
      });
    }
    return exports;
  }
}));

System.register("pixi.js", [], () => ({
  execute() {
    return PIXI;
  }
}));

for (const k of Object.keys(RMMZ)) {
  globalThis[k] = RMMZ[k];
}

export function start() {
  const main = new RMMZ.Main();
  main.run();
  return main;
}
