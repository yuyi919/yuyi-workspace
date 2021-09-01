import { DefPropDec$$ } from "./keys";
import { ARRAY, FUNCTION, OBJECT } from "./constructor";

export const ENTRIES = OBJECT.entries;
export const IS_ARR = ARRAY.isArray;
export const CALLER = FUNCTION.call;

export const PARSE_FLOAT = parseFloat;
export const PARSE_INT = parseInt;

export const EMPTY_OBJECT = OBJECT.seal(OBJECT.create(null));
/**
 * ```ts
 * Object.keys
 * ```
 * */
export const OBJ_KEYS = OBJECT.keys;
/**
 * ```ts
 * Object.freeze
 * ```
 * */
export const OBJ_FREEZE = OBJECT.freeze;
/**
 * ```ts
 * Object.assign
 * ```
 * */
export const OBJ_ASSIGN = OBJECT.assign;
/**
 * ```ts
 * Object.getOwnPropertyDescriptors
 * ```
 * */
export const OBJ_getOwnPropertyDescriptors$ = OBJECT.getOwnPropertyDescriptors;
/**
 * ```ts
 * Object.defineProperty
 * ```
 * */
export const OBJ_defineProperty$ = OBJECT.defineProperty;
/**
 * ```ts
 * Object.defineProperties
 * ```
 * */
export const OBJ_defineProperties$ = OBJECT.defineProperties;

const { V, E, C, W } = DefPropDec$$;
/**
 * ```ts
 * Object.defineProperty
 * writable: true,
 * configurable: true,
 * enumerable: true,
 * value: param
 * ```
 * */
export const OBJ_definePropertyNormal$ = function (
  target: any,
  key: Exclude<keyof typeof target, number>,
  value: any
) {
  return OBJECT.defineProperty(target, key, {
    [V]: value,
    [W]: true,
    [C]: true,
    [E]: true,
  });
};
/**
 * ```ts
 * Object.getPrototypeOf
 * ```
 * */
export const OBJ_getPrototypeOf$ = OBJECT.getPrototypeOf;
/**
 * ```ts
 * Object.getOwnPropertyDescriptor
 * ```
 * */
export const OBJ_getOwnPropertyDescriptor$ = OBJECT.getOwnPropertyDescriptor;
/**
 * ```ts
 * Object.getOwnPropertyNames
 * ```
 * */

export const OBJ_getOwnPropertyNames$ = OBJECT.getOwnPropertyNames;
export const PROMISE = Promise;
export const CREATE_NEW = Reflect.construct;
