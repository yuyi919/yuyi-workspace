import { Types } from "..";

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${"" extends P ? "" : "."}${P}`
    : never
  : never;

/**
 * @beta
 */
export type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? `${K}` | Join<K, Paths<T[K], Types.Number.Minus<D>>>
        : never;
    }[keyof T]
  : "";

/**
 * @beta
 */
export type LeafPaths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
  ? { [K in keyof T]-?: Join<K, LeafPaths<T[K], Types.Number.Minus<D>>> }[keyof T]
  : "";
/**
 * @beta
 */
export type ParentPaths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: T[K] extends Record<string, any>
        ? K extends string
          ? `${K}` | Join<K, ParentPaths<T[K], Types.Number.Minus<D>>>
          : never
        : never;
    }[keyof T]
  : "";

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
