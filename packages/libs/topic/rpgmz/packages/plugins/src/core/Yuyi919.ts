import * as Easing from "./Easing";
export * from "./Global";
export * from "./proxyMethod";
export * as Audio from "./playSe";
export * as EventCommand from "./EventCommand";
export * from "./reverseKeyAndValue";
export { Easing };
export { callCommandWith, transformToClass } from "@yuyi919/rpgmz-plugin-transformer";
export function registerFunc<Args extends any[], Result>(
  name: string,
  callback: (global: import("./Global").GlobalObj, ...args: Args) => Result
): (...args: Args) => Result {
  return (Yuyi919[name] = function (...args: Args) {
    return callback(globalThis as any, ...args);
  });
}
