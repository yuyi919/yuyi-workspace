/**
 * keyof PropertyDescriptor
 * writable, configurable, value, enumerable
 * @internal
 */
export enum DefPropDec$$ {
  W = "writable",
  C = "configurable",
  V = "value",
  E = "enumerable",
  G = "get",
  S = "set"
}

/**
 * @internal
 */
export const KEY_PREFIX_INJECT: "__$$_" = "__$$_";

/**
 * @internal
 */
export const KEY_STRICT: "strict" = "strict";

/**
 * @internal
 */
export const KEY_CONSTRUCTOR: "constructor" = "constructor";

/**
 * @internal
 */
export const KEY_EXTEND: "extend" = "extend";

/**
 * @internal
 */
export const KEY_FILTER: "filter" = "filter";

/**
 * @internal
 */
export const KEY_PROPERTY: "property" = "property";

/**
 * @internal
 */
export const KEY_PROTOTYPE: "prototype" = "prototype";

/**
 * @internal
 */
export const KEY_NUM: "number" = "number";

/**
 * @internal
 */
export const KEY_STR: "string" = "string";

/**
 * @internal
 */
export const KEY_BOOL: "boolean" = "boolean";

/**
 * @internal
 */
export const KEY_UNDEFINED: "undefined" = "undefined";

/**
 * @internal
 */
export const KEY_NULL: "null" = "null";

/**
 * @internal
 */
export const KEY_SYMBOL: "symbol" = "symbol";

/**
 * @internal
 */
export const KEY_BIGINT: "bigint" = "bigint";

/**
 * @internal
 */
export const KEY_FUNC: "function" = "function";

/**
 * @internal
 */
export const KEY_ARR: "array" = "array";

/**
 * @internal
 */
export const KEY_OBJ: "object" = "object";

/**
 * @internal
 */
export const KEY_VAL: "value" = DefPropDec$$.V;

/**
 * @internal
 */
export const KEY_DESIGN_TYPE: "design:type" = "design:type";

/**
 * @internal
 */
export const KEY_DESIGN_RETURNTYPE: "design:returntype" = "design:returntype";

/**
 * @internal
 */
export const KEY_DESIGN_PARAMTYPES: "design:paramtypes" = "design:paramtypes";
