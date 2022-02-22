/**
 * * keyof PropertyDescriptor
 * writable, configurable, value, enumerable
 */
export enum DefPropDec$$ {
  W = "writable",
  C = "configurable",
  V = "value",
  E = "enumerable",
  G = "get",
  S = "set"
}

export const KEY_PREFIX_INJECT: "__$$_" = "__$$_";
export const KEY_STRICT: "strict" = "strict";
export const KEY_CONSTRUCTOR: "constructor" = "constructor";
export const KEY_EXTEND: "extend" = "extend";
export const KEY_FILTER: "filter" = "filter";
export const KEY_PROPERTY: "property" = "property";
export const KEY_PROTOTYPE: "prototype" = "prototype";
export const KEY_NUM: "number" = "number";
export const KEY_STR: "string" = "string";
export const KEY_BOOL: "boolean" = "boolean";
export const KEY_FUNC: "function" = "function";
export const KEY_OBJ: "object" = "object";
export const KEY_VAL: "value" = DefPropDec$$.V;
export const KEY_DESIGN_TYPE: "design:type" = "design:type";
export const KEY_DESIGN_RETURNTYPE: "design:returntype" = "design:returntype";
export const KEY_DESIGN_PARAMTYPES: "design:paramtypes" = "design:paramtypes";
