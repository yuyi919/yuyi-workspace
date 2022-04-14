import "./index.less";
import * as Core from "./index";
import { System } from "./lib/System";

globalThis.System = System;

type a = Core.MZ.Action;
System.register("@yuyi919/rpgmz-core", [], () => ({
  execute() {
    const exports = {
      default: globalThis
    };
    // eslint-disable-next-line guard-for-in
    for (const key in Core) {
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

for (const k of Object.keys(Core)) {
  globalThis[k] = Core[k];
}

export function start() {
  const main = new Core.Main();
  main.run();
  return main;
}
// start();
