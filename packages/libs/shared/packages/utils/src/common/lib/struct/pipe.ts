import { isFunction } from "lodash";
import { Constant$ } from "@yuyi919/shared-constant";
import { castComputedPipe } from "./castUtils";

/**
 * 管道函数，将一组函数组合成管道，像流水线一样让原始值流过。
 * @param initialValue - 原始值
 * @param funcArr - @rest 函数数组
 * @typeParam T - 输入值类型
 * @typeParam R - 输出值类型
 * @returns 从第二个函数开始，入参都为上一个函数返回的结果。最后返回最后一个函数输出的结果
 * @example
 * 基本使用
 *```ts
 * var result = pipe(-1.1, Math.abs, Math.ceil)
 * console.log(result) // => 2
 *```
 */
export function pipe<T, R>(initialValue: T, ...funcArr: ((v: T | R) => R)[]): R {
  return funcArr.length > 0
    ? Constant$.REDUCE(funcArr, (value, func) => castComputedPipe(func, value), initialValue as any)
    : initialValue;
}

/**
 * 管道函数，将一组函数组合成管道，像流水线一样让原始值流过。
 * @param initialValue - 原始值
 * @param funcArr - @rest 函数数组
 * @typeParam T - 输入值类型
 * @typeParam R - 输出值类型
 * @returns 返回一个数组，第一个为原始值，之后为每个函数按顺序执行返回的结果
 * @example
 * 基本使用
 *```ts
 * var result = pipeTrack(-1.1, Math.abs, Math.ceil)
 * console.log(result) // => [-1.1, 1.1, 2]
 *```
 */
export function pipeTrack<T, R>(initialValue: T, ...funcArr: ((v: T | R) => R)[]): [T, ...R[]] {
  let last: any;
  return funcArr.length > 0
    ? Constant$.REDUCE(
        funcArr,
        (track, func) => {
          last = track[track.length - 1];
          track.push(castComputedPipe(func, last));
          return track;
        },
        [initialValue] as any
      )
    : [initialValue];
}

/**
 * 管道函数，将一组函数组合成管道，像流水线一样让检查值流过。
 * @param checkValue - 检查值
 * @param funcArr - @rest 函数数组
 * @typeParam T - 输入值类型
 * @typeParam R - 输出值类型
 * @returns 如果每个函数都通过，最后则返回检查值自身。否则返回`undefined`
 * @example
 * 基本使用
 *```ts
 * // 函数依次为是否非空、是否是数字
 * var result = pipeFilter(1, v => !_.isNil(v), _.isNumber)
 * console.log(result) // => 1
 *
 * result = pipeFilter(null, v => !_.isNil(v), _.isNumber)
 * console.log(result) // => undefined
 *```
 */
export function pipeFilter<T>(checkValue: T, ...funcArr: ((v: T) => boolean)[]): T | undefined {
  let index = -1;
  let func = null;
  while (++index < funcArr.length) {
    func = funcArr[index];
    if (isFunction(func) && !func(checkValue)) {
      return undefined;
    }
  }
  return checkValue;
}
