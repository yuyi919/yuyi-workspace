import {
  isArguments,
  isArr,
  isBigInt,
  isBool,
  isDate,
  isEmpty,
  isError,
  isFn,
  isNaN,
  isNil,
  isNull,
  isNum,
  isObj,
  isPrimitive,
  isPromise,
  isRegExp,
  isStr,
  isSymbol,
  isThenable,
  isUndefined,
  isEsModule,
  isEsModuleWithDefaultExport
} from "./checker";
import { ToUpperCaseFirst, ToLowerCaseFirst } from "../namespaces/string";
const checker = {
  isArguments,
  isArr,
  isBigInt,
  isBool,
  isDate,
  isEmpty,
  isError,
  isFn,
  isNaN,
  isNil,
  isNull,
  isNum,
  isObj,
  isPrimitive,
  isPromise,
  isRegExp,
  isStr,
  isSymbol,
  isThenable,
  isUndefined,
  isEsModule,
  isEsModuleWithDefaultExport
};
/**
 * @public
 */
type ComputedCheckerKey<K extends string> = K extends `${infer A}${infer B}`
  ? `is${ToUpperCaseFirst<A>}${B}`
  : K;

/**
 * @public
 */
export type CheckerHandles = {
  [K in Extract<keyof typeof checker, `is${string}`>]: typeof checker[K];
};

/**
 * @public
 */
export type CheckerHandleFactory<
  CheckerHandles extends Record<string, any>,
  Keys extends keyof CheckerHandles = keyof CheckerHandles
> = {
  [K in Extract<Keys, `is${string}`> extends `is${infer type}`
    ? type extends "NaN"
      ? "NaN"
      : ToLowerCaseFirst<type>
    : never]: CheckerHandles[ComputedCheckerKey<K>];
};

/**
 * @public
 */
export type Checker = CheckerHandleFactory<CheckerHandles>;

/**
 * @public
 * see {@link Checker}
 */
const is: Checker = /* @__PURE__ */ (() => {
  const is: Checker = {} as Checker;
  // eslint-disable-next-line guard-for-in
  for (const key in checker) {
    const type = key.replace(/^is/, "");
    type K = "num";
    is[(type === "NaN" ? type : type[0].toLowerCase() + type.slice(1)) as K] =
      checker[key as ComputedCheckerKey<K>];
  }
  return is;
})();

export { is };
export * from "./checker";

/**
 * 强制类型转换
 * @public
 * @param target -
 */
export function as<T>(target: any): T {
  return target as T;
}
