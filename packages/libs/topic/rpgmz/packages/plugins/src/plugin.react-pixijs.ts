/*:zh
 * @target MZ
 * @plugindesc yuyi919_PluginManager
 * @author yuyi919
 *
 * @help
 * yuyi919_PluginManager
 */
import * as ReactPixijs from "./react-pixijs";

window.ReactPixijs = ReactPixijs;

/**
 * yuyi919插件核心
 */
declare global {
  interface Window {
    ReactPixijs: typeof ReactPixijs;
  }
  export namespace globalThis {
    export { ReactPixijs };
  }
  export namespace ReactPixijs {
    //@ts-ignore
    export * from "./react-pixijs";
  }
}
