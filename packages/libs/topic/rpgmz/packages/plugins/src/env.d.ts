declare interface Game_Screen {
  startScale(x: number, y: number, scale: number, duration: number, a: string): void;
}

// /**
//  * yuyi919插件核心
//  */
// declare module Yuyi919 {
//   export function registerFunc<Args extends any[], Result>(
//     name: string,
//     callback: (
//       global: import('./utils/Global').Global,
//       ...args: Args
//     ) => Result
//   ): (...args: Args) => Result;
// }
