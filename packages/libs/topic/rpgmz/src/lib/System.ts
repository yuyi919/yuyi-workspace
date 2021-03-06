
const module_exports: Record<string, any> = {};
const logger = console;

interface SystemModule {
  setters?: ((module: typeof module_exports) => void)[];
  execute?: Function;
}

const modules: Record<string, SystemModule> = {};
const moduleLoaders: Record<string, Promise<SystemModule>> = {};
const loadListener: Record<string, (...args: any[]) => SystemModule | Promise<SystemModule>> = {};
export function mockLoadedEsModule(
  name: string,
  loader: (...args: any[]) => Promise<SystemModule>
) {
  loadListener[name] = loader;
}
//@ts-ignore
export const System = {
  modules,
  module_exports,
  moduleLoaders,
  register(name: string, requires: string[], module: (...args: any[]) => SystemModule | void) {
    // if (name.indexOf("@yuyi919/rpgmz-")===0) {
    //   System.register(name.replace("@yuyi919/rpgmz-", "@yuyi919-rmmz/"), requires, module)
    // }
    if (!moduleLoaders[name]) {
      const load = async () => {
        const exports = {} as any;
        const { currentScript } = document;
        await Promise.all(Object.values(moduleLoaders));
        const requireds = requires.map((name) =>
          name === "exports" ? exports : module_exports[name] || modules[name]?.execute?.()
        );
        // @ts-ignore
        const Module = loadListener[name]
          ? await loadListener[name](...requireds)
          : module(
              // 兼容SystemJs和AmdJS规范
              ...requireds
              //   (key, value) => {
              //   _exports[name] = _exports[name] || {};
              //   _exports[name][key] = value;
              //   console.log(_exports, name);
              // }
            );
        // 兼容SystemJs和AmdJS规范
        module_exports[name] = exports;
        if (Module) {
          if (Module.setters) {
            Module.setters.forEach((setter, index) => {
              const requireModuleName = requires[index];
              // console.debug(
              //   'require',
              //   requireModuleName,
              //   _exports[requireModuleName]
              // );
              setter(module_exports[requireModuleName]);
            });
          }
          document.currentScript ||
            (currentScript &&
              Object.defineProperty(document, "currentScript", { value: currentScript }));
          module_exports[name] = Module.execute?.() || module_exports[name];
          modules[name] = Module;
          return Module;
        }
        logger.debug("Loaded Module:", name);
      };
      logger.debug("Load Module:", name);
      moduleLoaders[name] = load();
    }
  }
};
function loadEsModule(
  name: string,
  required: string[],
  callback: (...modules: any[]) => void | SystemModule
) {
  System.register(name, required, callback);
}
globalThis.loadEsModule = loadEsModule;

/**
 * 插件模块加载器核心
 */
declare global {
  interface Window {
    loadEsModule: typeof loadEsModule;
  }
  export namespace globalThis {
    export { loadEsModule };
  }
}

