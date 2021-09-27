import * as Core from "@yuyi919/rpgmz-core";
import * as cls from "class-transformer";
import * as helper from "@yuyi919/rpgmz-plugin-transformer";
import * as tslib from "tslib";
import * as mobx from "mobx";
import "reflect-metadata";
// import { createLogger } from "@yuyi919/shared-logger";

const _exports: Record<string, any> = {};
const logger = console

type SystemModule = {
  setters?: ((module: typeof _exports) => void)[];
  execute: Function;
};
const modules: Record<string, SystemModule> = {};
//@ts-ignore
export const System = {
  register(name: string, requires: string[], module: (...args: any[]) => SystemModule | void) {
    // if (name.indexOf("@yuyi919/rpgmz-")===0) {
    //   System.register(name.replace("@yuyi919/rpgmz-", "@yuyi919-rmmz/"), requires, module)
    // }
    if (!modules[name]) {
      const exports = {} as any;
      //@ts-ignore
      const Module = module(
        // 兼容SystemJs和AmdJS规范
        ...requires.map((name) =>
          name === "exports" ? exports : modules[name]?.execute?.() || _exports[name]
        )
        //   (key, value) => {
        //   _exports[name] = _exports[name] || {};
        //   _exports[name][key] = value;
        //   console.log(_exports, name);
        // }
      );
      // 兼容SystemJs和AmdJS规范
      _exports[name] = exports;
      if (Module) {
        if (Module.setters) {
          Module.setters.forEach((setter, index) => {
            const requireModuleName = requires[index];
            // console.debug(
            //   'require',
            //   requireModuleName,
            //   _exports[requireModuleName]
            // );
            setter(_exports[requireModuleName]);
          });
        }
        _exports[name] = Module.execute() || _exports[name];
        modules[name] = Module;
      }
      logger.debug("Load Module:", name);
    }
  },
};
System.register("@yuyi919/rpgmz-core", [], () => ({
  execute() {
    const exports = {
      default: globalThis,
    };
    for (const key in Core) {
      Object.defineProperty(exports, key, {
        get() {
          return globalThis[key];
        },
      });
    }
    return exports;
  },
}));
System.register("@yuyi919/rpgmz-plugin-transformer", [], () => ({
  execute() {
    return helper;
  },
}));

System.register("class-transformer", [], () => ({
  execute() {
    return cls;
  },
}));
System.register("mobx", [], () => ({
  execute() {
    return mobx;
  },
}));
System.register("tslib", [], () => ({
  execute() {
    return tslib;
  },
}));

// @ts-ignore
window.loadEsModule = (
  name: string,
  required: string[],
  callback: (...modules: any[]) => void | SystemModule
) => {
  System.register(name, required, callback);
};
