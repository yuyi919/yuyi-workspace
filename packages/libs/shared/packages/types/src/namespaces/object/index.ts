import { OBJECT } from "@yuyi919/shared-constant";
import { Types } from "..";

/**
 *
 * 等价于
 * ```ts
 * Object.prototype.hasOwnProperty.call(target, key)
 * ```
 * @param target -
 * @param key -
 * @example
 * ```ts
 * const o = new Object();
 * o.prop = "exists";
 * o.hasOwnProperty("prop");             // 返回 true
 * o.hasOwnProperty("toString");         // 返回 false
 * o.hasOwnProperty("hasOwnProperty");   // 返回 false
 * ```
 * @public
 */
export function hasOwnKey<Key extends string | symbol, T = any>(
  target: any,
  key: Key
): target is Types.RecordWithKey<Key, T> {
  return !!target && OBJECT.prototype.hasOwnProperty.call(target, key);
}

type DeepResolveWith<D, K extends string[]> = K extends [infer B, ...infer other]
  ? B extends keyof D
    ? other extends [string, ...string[]]
      ? DeepResolveWith<D[B], other>
      : D[B]
    : never
  : never;
/**
 * deep.get
 * @beta
 * @example
 *```ts
 * type target = { a: { b: 1; c: { d: 2 } }; e: 3 };
 * type Result1 = DeepResolve<target, "a.c.d">; // => 2;
 * type Result2 = DeepResolve<target, "a.c">; // => { d: 2 };
 * type Result3 = DeepResolve<target, "a.c.f">; // => never;
 * type Result4 = DeepResolve<target, "a.cd"> // => never;
 *```
 */
export type DeepResolve<D, K extends string> = DeepResolveWith<D, Types.String.Split<K, ".">>;

// type target = { a: { b: 1; c: { d: 2 } }; e: 3 };
// type Result1 = DeepResolve<target, "a.c.d">; // => 2;
// type Result2 = DeepResolve<target, "a.c">; // => { d: 2 };
// type Result3 = DeepResolve<target, "a.c.f">; // => never;
// type Result4 = DeepResolve<target, "a.cd"> // => never;

/**
 * 交换对象的key和value类型
 * @beta
 * @example
 * ```ts
 * type Source = {
 *  A: string;
 *  B: 2;
 * };
 * type Result = TReverseKV<Source>; // => { 1: "A"; 2: "B"; }
 * ```
 */
export type ReverseKV<
  Source extends Record<string, any>,
  Keys extends keyof Source = keyof Source
> = {
  [ValueKey in Source[Keys]]: Extract<
    { [Key in Keys]: [Source[Key], Key] }[Keys],
    [ValueKey, any]
  >[1];
};

/**
 * 测试
 */
// type Source = {
//   A: string;
//   B: 2;
// };
// type Result = ReverseKV<Source>; // { 1: "A"; 2: "B"; }

import type * as DeepPath from "./Path";

export type { DeepPath };
