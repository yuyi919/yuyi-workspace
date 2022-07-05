/* eslint-disable @typescript-eslint/no-namespace */
import { Types } from "..";
import { Recordable } from "../shared";

/**
 * @example
 * ```ts
 * interface NestedObjectType {
 *   a: any;
 *   b: any;
 *   nest: { c: any; };
 *   otherNest: {
 *     c: any;
 *     d: { e: any; };
 *   };
 * }
 *
 * type NestedObjectPaths = Path.All<NestedObjectType>;
 * // => "a" | "b" | "nest" | "otherNest" | "nest.c" | "otherNest.c" | "otherNest.d" | "otherNest.d.e"
 * type NestedObjectLeaves = Path.Leaf<NestedObjectType>;
 * // => "a" | "b" | "nest.c" | "otherNest.c" | "otherNest.d.e"
 * type NestedObjectParents = Path.Parent<NestedObjectType>;
 * // => "nest" | "otherNest" | "otherNest.d"
 * ```
 * @beta
 */
export type All<T, D extends number = 10> = Types.ExcludeNever<
  D,
  T extends Recordable
    ? {
        [K in keyof T]-?: K extends string | number
          ? `${K}` | Types.String.JoinWith<K, All<T[K], Types.Number.Minus<D>>, ".">
          : never;
      }[keyof T]
    : ""
>;

/**
 * {@inheritDoc All}
 * @beta
 */
export type Leaf<T, D extends number = 10> = Types.ExcludeNever<
  D,
  T extends Recordable
    ? T extends Types.Fn // object 无法区别function类型，所以单独做一个判断
      ? ""
      : {
          [K in keyof T]-?: Types.String.JoinWith<K, Leaf<T[K], Types.Number.Minus<D>>, ".">;
        }[keyof T]
    : ""
>;

/**
 * {@inheritDoc All}
 * @beta
 */
export type Parent<T, D extends number = 10> = Types.ExcludeNever<
  D,
  T extends Recordable
    ? {
        [K in keyof T]-?: T[K] extends Recordable
          ? K extends string
            ? `${K}` | Types.String.JoinWith<K, Parent<T[K], Types.Number.Minus<D>>, ".">
            : never
          : never;
      }[keyof T]
    : ""
>;
