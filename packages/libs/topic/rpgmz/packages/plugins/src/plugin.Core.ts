/*:zh
 * @target MZ
 * @plugindesc yuyi919_PluginManager
 * @author yuyi919
 *
 * @help
 * yuyi919_PluginManager
 */
import "./hack";
import * as Yuyi919 from "./core";

window.Yuyi919 = Yuyi919;

/**
 * yuyi919插件核心
 */
declare global {
  interface Window {
    Yuyi919: typeof Yuyi919;
  }
  export namespace globalThis {
    export { Yuyi919 };
  }
  export namespace Yuyi919 {
    //@ts-ignore
    export * from "./core";
  }
}
