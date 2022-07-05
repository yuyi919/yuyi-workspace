import { loadCustomPlugins } from "./index";
// import * as l from "./index";
// Object.assign(globalThis, {
//   loadCustomPlugins
// });
globalThis.loadCustomPlugins = loadCustomPlugins;
console.log("DEV: " + import.meta.env.DEV);
if (import.meta.env.DEV) {
  globalThis.__DEV__ = true;
}
//
// loadCustomPlugins($, globalThis.TYRANO, globalThis.object);
