/* eslint-disable no-var */
import { default as Yuyi919_AdvCore } from "./AdvCore";
export { Yuyi919_AdvCore };
export * from "./AdvCore";

window.Yuyi919_AdvCore = Yuyi919_AdvCore;
/**
 * yuyi919插件核心
 */
declare global {
  interface Window {
    Yuyi919_AdvCore: typeof Yuyi919_AdvCore;
  }
  export namespace globalThis {
    export { Yuyi919_AdvCore };
  }
}
