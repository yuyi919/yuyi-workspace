import { DynamicString, Recordable } from "./namespaces/shared";

const types = [
  "boolean",
  "number",
  "string",
  "function",
  "array",
  "date",
  "regExp",
  "object",
  "error",
  "symbol",
  "ArrayBuffer",
] as const;

/**
 *
 * @public
 */
export type BuiltinTypes =
  | typeof types[number]
  | "null"
  | "NaN"
  | "typedArray"
  | "undefined"
  | "bigint";
const class2type = {} as Record<string, BuiltinTypes>;

for (const type of types) {
  class2type[`[object ${type[0].toUpperCase() + type.slice(1)}]`] = type;
}

/**
 *
 * @param target -
 * @beta
 */
export function getType(target: unknown): BuiltinTypes | DynamicString {
  const type = Object.prototype.toString.call(target) as string;
  if (target === null) return "null";
  if (typeof target === "number" && target !== target) return "NaN";

  const isObject = typeof target === "object";
  const isFn = typeof target === "function";
  return isObject || isFn
    ? class2type[type] || (/\wArray\]$/.test(type) ? "typedArray" : "object")
    : typeof target;
}

/**
 *
 * @param target -
 * @beta
 */
export function getTypeTag(target: unknown) {
  return Object.prototype.toString.call(target) as string;
}

/**
 *
 * @param target -
 * @public
 */
export function isPrimitive(target: unknown): target is string | number {
  return isNum(target) || typeof target === "string";
}

/**
 *
 * @param target -
 * @public
 */
export function isArr<T>(target: unknown): target is T[] {
  return getType(target) === "array";
}

/**
 *
 * @param target -
 * @public
 */
export function isNum(target: unknown): target is number {
  return typeof target === "number" && target === target;
}

/**
 *
 * @param target -
 * @public
 */
export function isStr(target: unknown): target is string {
  return typeof target === "string";
}

/**
 *
 * @param target -
 * @public
 */
export function isObj(target: unknown): target is object {
  return getType(target) === "object";
}
/**
 *
 * @param target -
 * @public
 */
export function isBool(target: unknown): target is boolean {
  return !!target === target;
}

/**
 *
 * @param target -
 * @public
 */
export function isFn<Func extends (...data: any) => any = (...data: any) => any>(
  target: unknown
): target is Func {
  return typeof target === "function" && "call" in target;
}

/**
 *
 * @param target -
 * @public
 */
export function isUndefined(target: unknown): target is undefined {
  return target === void 0;
}

/**
 *
 * @param target -
 * @public
 */
export function isNull(target: unknown): target is null {
  return target === null;
}

/**
 *
 * @param target -
 * @public
 */
export function isEmpty(target: unknown): boolean {
  const t = getType(target);
  switch (t) {
    case "object":
      return Object.keys(target as Recordable).length === 0;
    case "array":
      return (target as any[]).length === 0;
    case "string":
      return !(target as string).trim();
    case "number":
      return target === 0;
    case "undefined":
    case "null":
      return true;
    default:
      return false;
  }
}

/**
 *
 * @param target -
 * @public
 */
export function isNil(target: unknown): target is null | undefined {
  return target === void 0 || target === null;
}

/**
 * 严格检查一个NaN数值
 * @param target -
 * @public
 * @example
 * ```
 * isNumNaN(NaN) // => true
 * globalThis.isNaN({}) // => true
 * globalThis.isNaN(undefined) // => true
 * isNumNaN({}) // => false
 * isNumNaN(undefined) // => false
 * ```
 */
export function isNumNaN(target: unknown): target is number {
  return typeof target === "number" && target !== target;
}
