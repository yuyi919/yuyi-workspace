export * from "./custom-is";
export * from "./getRealLength";
export * from "./isEqual";
export * from "./isFunction";
export * from "./isNil";
export * from "./isNumber";
export * from "./isObject";
export * from "./lodash";
export * from "./propertiesDefine";
export * from "./toGetter";
export * from "./helper";

import {
  setTrue$$,
  setValue$$,
  setWith$$,
  setWithEntries$$,
  setWithEntriesReverse$$,
  setWithKeyValue$$,
  setWithLabelValue$$,
  setWithValueLabel$$
} from "./setter";

/**
 * @internal
 */
export const Setter = {
  setTrue$$,
  setValue$$,
  setWith$$,
  setWithEntries$$,
  setWithEntriesReverse$$,
  setWithKeyValue$$,
  setWithLabelValue$$,
  setWithValueLabel$$
};

export {
  is,
  isStr,
  isNil,
  isRegExp,
  isArguments,
  isArr,
  isBigInt,
  isBool,
  isDate,
  isEmpty,
  isError,
  isEsModule,
  isEsModuleWithDefaultExport,
  isFn,
  isNull,
  isNum,
  isNaN,
  isObj,
  isPrimitive,
  isPromise,
  isSymbol,
  isThenable,
  isUndefined,
  hasOwnKey
} from "@yuyi919/shared-types";
