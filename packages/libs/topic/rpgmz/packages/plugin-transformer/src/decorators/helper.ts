import type { Game_Interpreter, PluginManager } from "@yuyi919/rpgmz-core";
import type Core from "@yuyi919/rpgmz-core";
import { ConstructorType } from "./metaData";
import { transformToClass } from "./utils";
export type Global = typeof Core & typeof window & typeof globalThis;

let localGlobal: Global;

export function initGlobal(global: Global) {
  localGlobal = global as any;
  let params: any;
  return {
    global: global,
    registerCommand(
      commandName: string,
      callback: (args: any, handle: Game_Interpreter, global: Global) => any
    ) {
      return registerCommand(global as any, commandName, function (this: Game_Interpreter, args) {
        try {
          return callback(args, this, localGlobal);
        } catch (error) {
          // alert(error.message);
        }
      });
    },
    getParameters<T extends Record<string, any>>(Target: ConstructorType<T>): T {
      if (!params) {
        const target = getParameters(localGlobal as any);
        params = transformToClass(Target, target);
      }
      return params as T;
    },
  };
}

export function getGlobal() {
  return {
    global: localGlobal,
    registerCommand(commandName: string, callback: (args: any) => any) {
      return registerCommand(localGlobal, commandName, callback);
    },
    getParameters() {
      return getParameters(localGlobal);
    },
  };
}

export function registerCommand(global: Global, commandName: string, callback: (args: any) => any) {
  const pluginName = decodeURI(
    global.PluginManagerEx.findPluginName(global.document.currentScript).trim()
  );
  const key = pluginName + ":" + commandName;
  const func =
    typeof callback === "function" ? callback : global.Game_Interpreter.prototype[callback];
  if (!func) {
    throw new Error(`Not found function Game_Interpreter : ${callback}`);
  }

  // console.log('registerCommand', key, callback);
  return global.PluginManager.registerCommand(
    pluginName,
    commandName,
    function (this: PluginManager, args: any) {
      func.call(this, global.PluginManagerEx.createCommandArgs(args, key));
    }
  );
}
export function getParameters(global: Global) {
  const name = decodeURI(
    global.PluginManagerEx.findPluginName(global.document.currentScript).trim()
  );
  return global.PluginManager.parameters(name);
}

export function createPlugin(callback: (global: ReturnType<typeof initGlobal>) => any) {
  return (global: Global) => {
    return callback(initGlobal(global));
  };
}

export default initGlobal(globalThis as Global);
// console.log(value, key);
