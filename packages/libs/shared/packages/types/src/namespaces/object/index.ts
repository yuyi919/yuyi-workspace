import { Types } from "..";

/**
 * @beta
 */
export type Paths<T, D extends number = 10> = Types.ExcludeNever<
  D,
  T extends object
    ? {
        [K in keyof T]-?: K extends string | number
          ? `${K}` | Types.String.JoinWith<K, Paths<T[K], Types.Number.Minus<D>>, ".">
          : never;
      }[keyof T]
    : ""
>;

/**
 * @beta
 */
export type LeafPaths<T, D extends number = 10> = Types.ExcludeNever<
  D,
  T extends object
    ? T extends Types.Fn // object 无法区别function类型，所以单独做一个判断
      ? ""
      : {
          [K in keyof T]-?: Types.String.JoinWith<K, LeafPaths<T[K], Types.Number.Minus<D>>, ".">;
        }[keyof T]
    : ""
>;
/**
 * @beta
 */
export type ParentPaths<T, D extends number = 10> = Types.ExcludeNever<
  D,
  T extends object
    ? {
        [K in keyof T]-?: T[K] extends Record<string, any>
          ? K extends string
            ? `${K}` | Types.String.JoinWith<K, ParentPaths<T[K], Types.Number.Minus<D>>, ".">
            : never
          : never;
      }[keyof T]
    : ""
>;

// type NestedObjectType = {
//   a: string;
//   b: string;
//   nest: {
//     c: string;
//   };
//   otherNest: {
//     c: string;
//   };
// };

// type NestedObjectPaths = Paths<NestedObjectType>;
// // type NestedObjectPaths = "a" | "b" | "nest" | "otherNest" | "nest.c" | "otherNest.c"
// type NestedObjectLeaves = LeafPaths<NestedObjectType>;
// // type NestedObjectLeaves = "a" | "b" | "nest.c" | "otherNest.c"

const s = Object.create({});
/**
 *
 * @param target
 * @param key
 * ```ts
 * // 等价于
 * Object.prototype.hasOwnProperty.call(target, key)
 * ```
 */
/**
 * @beta
 */
export function hasOwnKey<Key extends string | symbol, T = any>(
  target: any,
  key: Key
): target is Types.RecordWithKey<Key, T> {
  return Object.prototype.hasOwnProperty.call(target || s, key);
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
