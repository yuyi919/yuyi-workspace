import Core from "@yuyi919/rpgmz-core";
export type GlobalObj = typeof globalThis.Core & typeof globalThis & Window;

let localGlobal: GlobalObj;

export function init(global: GlobalObj) {
  localGlobal = global as any;
  window.console = global.console;
  return {
    global: global,
    registerCommand(
      commandName: string,
      callback: (args: any, handle: Core.Game_Interpreter, global: GlobalObj) => any
    ) {
      return registerCommand(
        global as any,
        commandName,
        function (this: Core.Game_Interpreter, args) {
          try {
            return callback(args, this, localGlobal);
          } catch (error) {
            // alert(error.message);
          }
        }
      );
    },
    getParameters() {
      return getParameters(localGlobal as any);
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

export function registerCommand(global: GlobalObj, commandName: string, callback: (args: any) => any) {
  const pluginName = decodeURI(
    global.PluginManagerEx.findPluginName(global.document.currentScript).trim()
  );
  const key = pluginName + ":" + commandName;
  const func =
    typeof callback === "function" ? callback : global.Game_Interpreter.prototype[callback];
  if (!func) {
    throw new Error(`Not found function Game_Interpreter : ${callback}`);
  }
  return global.PluginManager.registerCommand(
    pluginName,
    commandName,
    function (this: Core.PluginManager, args: any) {
      func.call(this, global.PluginManagerEx.createCommandArgs(args, key));
    }
  );
}
export function getParameters(global: GlobalObj) {
  const name = decodeURI(
    global.PluginManagerEx.findPluginName(global.document.currentScript).trim()
  );
  return global.PluginManager.parameters(name);
}

export function createPlugin(callback: (global: ReturnType<typeof init>) => any) {
  return (global: GlobalObj) => {
    return callback(init(global));
  };
}
