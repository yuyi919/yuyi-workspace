/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-use-before-define */
/**
 * @module LodashExtraUtils
 */

import { stubArray, stubFalse, stubTrue, stubString, stubObject } from "lodash";
import { Constant$ } from "@yuyi919/shared-constant";

/**
 * 一个静态函数
 * @param args - 任意参数
 * @returns 什么都不会返回
 * @beta
 */
export function stubFunction(...args: any[]): undefined;
//@ts-ignore
export function stubFunction(): undefined {}
/**
 * 一个只有返回功能的静态函数
 * @param args - 任意参数
 * @returns 传入什么返回什么，如果什么都没传则返回自身
 * @example
 *```ts
 * stubReturn(1, [])
 * // => 1
 *```
 * @beta
 */
export function stubReturn<T>(arg?: T, ...args: any[]): T;
/**
 * {@inheritDoc (stubReturn:1)}
 * @beta
 */
export function stubReturn(): typeof stubReturn;
export function stubReturn(args?: any) {
  return args || stubReturn;
}

/**
 * 一个只有返回功能的静态函数
 * @param args2 - 任意参数
 * @returns 第二个传入什么返回什么
 * @example
 *```ts
 * stubReturn2nd(1, 2, 4)
 * // => 2
 *```
 * @beta
 */
export function stubReturn2nd<T>(arg1?: any, arg2?: T, ...args: any[]): T;
export function stubReturn2nd(_?: any, arg2?: any) {
  return arg2;
}

/**
 * 一个只有返回功能的静态函数
 * @param args - 任意参数
 * @returns 传入收集起来的参数
 * @example
 *```ts
 * stubReturnArgs(1, 2, 4)
 * // => [1, 2, 4]
 *```
 * @beta
 */
// tslint:disable-next-line: no-empty
export function stubReturnArgs<T extends any[]>(...args: T): T;
export function stubReturnArgs(...args: any[]) {
  return args;
}

/**
 * 一个只有返回功能的静态函数
 * @param args - 任意参数
 * @returns 传入对象返回直接，如果不是对象或者什么都没传则返回空对象
 * @example
 *```ts
 * stubObjectReturn()
 * // => {}
 *
 * stubObjectReturn('23')
 * // => {}
 *
 * stubObjectReturn({ a: 1 })
 * // => { a: 1 } deep equal
 *```
 * @beta
 */
export function stubObjectReturn<T>(arg?: T, ...args: any[]): T extends object ? T : {};
export function stubObjectReturn(args: any) {
  return args instanceof Object ? args : {};
}

/**
 * 一个静态的不可变空对象
 * @beta
 */
export const emptyObject: object = Constant$.EMPTY_OBJECT;

/**
 * 一个静态函数，返回一个对象
 * @returns 一个静态的空对象，多次调用也永远指向同一个内存地址
 * @example
 *```ts
 * stubObjectStatic()
 * // => {}
 *```
 * @beta
 */
export function stubObjectStatic(...args: any[]): typeof Constant$.EMPTY_OBJECT;
export function stubObjectStatic() {
  return Constant$.EMPTY_OBJECT;
}

export { stubObject, stubArray, stubFalse, stubTrue, stubString };
