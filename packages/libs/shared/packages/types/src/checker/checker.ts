import Types from "..";
import {
  OBJECT,
  KEY_BOOL,
  KEY_NUM,
  KEY_OBJ,
  KEY_ARR,
  KEY_FUNC,
  KEY_STR,
  KEY_SYMBOL,
  KEY_UNDEFINED,
  KEY_NULL,
  KEY_BIGINT,
  UNDEFINED,
  NULL,
  PROMISE,
  CALLER,
  OBJ_KEYS
} from "@yuyi919/shared-constant";
import { DynamicString, Recordable } from "../namespaces/shared";
import { EsModuleLike, EsModuleLikeWithDefault } from "../namespaces/module";

const types = [KEY_BOOL, KEY_NUM, KEY_STR, KEY_FUNC, KEY_ARR, KEY_OBJ, KEY_SYMBOL] as const;
const TYPES = ["Date", "RegExp", "Error", "ArrayBuffer"] as const;

/**
 *
 * @public
 */
export type BuiltinTypes =
  | typeof types[number]
  | typeof TYPES[number]
  | "null"
  | "NaN"
  | "TypedArray"
  | "undefined"
  | "bigint";

const class2type = /* @__PURE__ */ (() => {
  const class2type = {} as Record<string, BuiltinTypes>;
  // eslint-disable-next-line prefer-const
  let length = types.length as number,
    i = -1,
    type: BuiltinTypes;
  while (length - ++i && (type = types[i])) {
    class2type[`[object ${type[0].toUpperCase() + type.slice(1)}]`] = type;
  }
  length = TYPES.length as number;
  i = -1;
  while (length - ++i && (type = TYPES[i])) {
    // console.log(`[object ${type}]`, type)
    class2type[`[object ${type}]`] = type;
  }
  return class2type;
})();
/**
 *
 * @param target -
 * @beta
 */
export function getType(target: any): BuiltinTypes | DynamicString {
  if (target === NULL) return KEY_NULL;
  if (target === UNDEFINED) return KEY_UNDEFINED;
  const type = _toString(target) as string;
  // console.log(target, type, class2type[type])
  const typeofT = typeof target;
  if (typeofT === KEY_NUM && target !== target) return "NaN";

  const isObject = typeofT === KEY_OBJ;
  const isFn = typeofT === KEY_FUNC;
  return isObject || isFn
    ? class2type[type] || (/\wArray\]$/.test(type) ? "TypedArray" : KEY_OBJ)
    : typeofT;
}

const _toString = /* @__PURE__ */ CALLER.bind(OBJECT.prototype.toString) as (
  target?: any
) => `[object ${string}]`;
/**
 *
 * @param target -
 * @beta
 */
export function getTypeTag(target: any): `[object ${string}]` {
  return _toString(target) as any;
}

/**
 *
 * @param target -
 * @public
 */
export function isPrimitive(target: any): target is Types.Primitive {
  let type: string;
  return (
    target == NULL ||
    ((type = typeof target),
    type === KEY_BOOL ||
      type === KEY_NUM ||
      type === KEY_STR ||
      type === KEY_SYMBOL || // ES6 symbol
      type === KEY_UNDEFINED)
  );
}

/**
 *
 * @param target -
 * @public
 */
export function isArr<T>(target: any): target is T[] {
  return getType(target) === KEY_ARR;
}

/**
 *
 * @param target -
 * @public
 */
export function isNum(target: any): target is number {
  return typeof target === KEY_NUM && target === target;
}

/**
 *
 * @param target -
 * @public
 */
export function isStr(target: any): target is string {
  return typeof target === KEY_STR;
}

/**
 *
 * @param target -
 * @public
 */
export function isObj<T extends object>(target: any): target is T;
/**
 * {@inheritdoc (isObj:1)}
 * @public
 */
export function isObj(target: any): target is object;
export function isObj(target: any): target is object {
  return getType(target) === KEY_OBJ;
}
/**
 *
 * @param target -
 * @public
 */
export function isBool(target: any): target is boolean {
  return !!target === target;
}

/**
 *
 * @param target -
 * @public
 */
export function isFn<Func extends Types.Fn = Types.Fn>(target: Func): target is Func;
/**
 * {@inheritdoc (isFn:1)}
 * @public
 */
export function isFn<Func extends Types.Fn = Types.Fn>(target: any): target is Func;
export function isFn<Func extends Types.Fn = Types.Fn>(target: any): target is Func {
  return typeof target === KEY_FUNC && "call" in (target as Function);
}

/**
 *
 * @param target -
 * @public
 */
export function isUndefined(target: any): target is undefined {
  return target === UNDEFINED;
}

/**
 *
 * @param target -
 * @public
 */
export function isNull(target: any): target is null {
  return target === NULL;
}

/**
 *
 * @param target -
 * @public
 */
export function isEmpty(target: any): boolean {
  const t = getType(target);
  switch (t) {
    case KEY_OBJ:
      return OBJ_KEYS(target as Recordable).length === 0;
    case KEY_ARR:
      return (target as any[]).length === 0;
    case KEY_STR:
      return !(target as string).trim();
    case KEY_NUM:
      return target === 0;
    case KEY_UNDEFINED:
    case KEY_NULL:
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
export function isNil(target: any): target is null | undefined {
  return target == NULL;
}

// /**
//  * 严格检查一个NaN数值
//  * @param target -
//  * @public
//  * @example
//  * ```ts
//  * isNaN(NaN) // => true
//  * globalThis.isNaN(NaN) // => true
//  * isNaN({}) // => false
//  * globalThis.isNaN({}) // => true
//  * isNaN(undefined) // => false
//  * globalThis.isNaN(undefined) // => true
//  * ```
//  */
// export function isNaN(target: any): target is number {
//   return typeof target === KEY_NUM && target !== target;
// }

/**
 * 严格检查一个NaN数值
 * @param target -
 * @public
 * @example
 * ```ts
 * isNaN(NaN) // => true
 * globalThis.isNaN(NaN) // => true
 * isNaN({}) // => false
 * globalThis.isNaN({}) // => true
 * isNaN(undefined) // => false
 * globalThis.isNaN(undefined) // => true
 * ```
 */
export function isNaN(target: any): target is number {
  return typeof target === KEY_NUM && target !== target;
}

/**
 *
 * @param target -
 * @public
 */
export function isSymbol(target: any): target is symbol {
  return typeof target === KEY_SYMBOL;
}

/**
 *
 * @param target -
 * @public
 */
export function isBigInt(target: any): target is BigInt {
  return typeof target === KEY_BIGINT;
}

/**
 *
 * @param target -
 * @public
 */
export function isRegExp(target: any): target is RegExp {
  return target && target instanceof RegExp;
}

/**
 *
 * @param target -
 * @public
 */
export function isDate(target: any): target is Date {
  return target && target instanceof Date;
}

/**
 * 判断一个对象是否为Promise
 * @param target -
 * @public
 */
export function isPromise<T>(target: any): target is Promise<T> {
  return (
    target instanceof PROMISE ||
    (!!target &&
      (typeof target === KEY_OBJ || typeof target === KEY_FUNC) &&
      typeof target.then === KEY_FUNC &&
      typeof target.catch === KEY_FUNC &&
      typeof target.finally === KEY_FUNC)
  );
}

/**
 * 判断一个对象是否为`Promise`或`PromiseLike`
 * @param target -
 * @public
 */
export function isThenable<T>(target: any): target is PromiseLike<T> {
  return (
    target instanceof PROMISE ||
    (!!target &&
      (typeof target === KEY_OBJ || typeof target === KEY_FUNC) &&
      typeof target.then === KEY_FUNC)
  );
}

/**
 *
 * @param target -
 * @public
 */
export function isArguments(target: any): target is IArguments {
  return target && _toString(target) === "[object Arguments]";
}

/**
 *
 * @param target -
 * @public
 */
export function isError(target: any): target is Error {
  return target && target instanceof Error;
}

/**
 * 判断是否是EsModule的导入
 * @param target - 目标对象
 * @param expectNull - 是否先进行非空判断，默认为true
 * @alpha
 */
export function isEsModule<T>(target: any, expectNull?: boolean): target is EsModuleLike<{}, T> {
  return (
    (!expectNull || target) &&
    (target.__esModule ||
      (Symbol && target[Symbol.toStringTag as unknown as string] === "Module") ||
      getTypeTag(target) === "[object Module]")
  );
}

/**
 * 判断是否是包含默认导出的EsModule导入
 * @param target - 目标对象
 * @param expectNull - 是否先进行非空判断，默认为true
 * @alpha
 */
export function isEsModuleWithDefaultExport<T>(
  target: any,
  expectNull?: boolean
): target is EsModuleLikeWithDefault<{}, T> {
  return (!expectNull || target) && "default" in target && isEsModule<T>(target, false);
}
