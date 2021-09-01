/* eslint-disable prefer-const */
import { Types } from "@yuyi919/shared-types";

/**
 * 判断目标是否为`null`或`undefined`
 * @param target
 */
export const nil = <T extends boolean = boolean>(target: any): target is T =>
  target === null || target === undefined;

/**
 * 判断目标是否为`number`类型，且不为NaN
 * @param target 目标
 */
export const num = <T extends number = number>(target: any): target is T =>
  (typeof target === "number" && isFinite(target)) as any;

/**
 * 判断目标是否为`boolean`类型
 * @param target 目标
 */
export const bool = <T extends boolean = boolean>(target: any): target is T =>
  typeof target === "boolean";
export const str = <T extends string = string>(target: any): target is T =>
  typeof target === "string";
export const arr = <T extends any = any>(target: any): target is T[] => target instanceof Array;
export const obj = <T extends object = object>(target: any): target is T =>
  target instanceof Object && !(target instanceof Array);
export const func = <T extends Types.Function.Base = Types.Function.Base>(
  target: any
): target is T => typeof target === "function";

/**
 * 判断目标是否为`null`
 * @param target
 */
export const NULL = <T extends null = null>(target: any): target is T => target === null;

/**
 * 判断目标是否为`undefined`
 * @param target
 */
export function UNDEFINED<T extends undefined = undefined>(target: any): target is T {
  return arguments.length > 0 && target === undefined;
}

export const OBJ = <T extends object = object>(target: any): target is T =>
  target && target.constructor === Object;
