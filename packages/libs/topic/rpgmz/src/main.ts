import { Main } from "@yuyi919/rpgmz-core";
import "./index.less";
import * as RMMZ from "./index";
import { mockLoadedEsModule, System } from "./System";

for (const k of Object.keys(RMMZ)) {
  globalThis[k] = RMMZ[k];
}
import "@plugins/plugin.Core";
mockLoadedEsModule("yuyi919_PluginManager.js", async () => {
  return {
    execute() {
      // ReactPixijs.Window(globalThis.Graphics.app);
    },
  };
});
mockLoadedEsModule("yuyi919_react-pixijs.js", async () => {
  const mod = await import("@plugins/plugin.react-pixijs");
  return {
    execute() {
      // ReactPixijs.Window(globalThis.Graphics.app);
      // init the scroller
      return mod;
    },
  };
});
globalThis.System = System;
const main = new Main();
main.run();
