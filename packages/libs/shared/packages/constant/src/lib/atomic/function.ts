import { DefPropDec$$ } from "./keys";
import { ARRAY, FUNCTION, OBJECT } from "./constructor";

/**
 * @internal
 */
export const ENTRIES = OBJECT.entries;

/**
 * @internal
 */
export const IS_ARR = ARRAY.isArray;

/**
 * @internal
 */
export const CALLER = FUNCTION.call;

/**
 * @internal
 */
export const PARSE_FLOAT = parseFloat;

/**
 * @internal
 */
export const PARSE_INT = parseInt;

/**
 * ```ts
 * Object.keys
 * ```
 * @internal
 * */
export const OBJ_KEYS = OBJECT.keys;
/**
 * ```ts
 * Object.freeze
 * ```
 * @internal
 * */
export const OBJ_FREEZE = OBJECT.freeze;
/**
 * ```ts
 * Object.seal
 * ```
 * @internal
 * */
export const OBJ_SEAL = OBJECT.seal;
/**
 * ```ts
 * Object.create
 * ```
 * @internal
 * */
export const OBJ_CREATE = OBJECT.create;
/**
 * ```ts
 * Object.assign
 * ```
 * @internal
 * */
export const OBJ_ASSIGN = OBJECT.assign;
/**
 * ```ts
 * Object.getOwnPropertyDescriptors
 * ```
 * @internal
 * */
export const OBJ_getOwnPropertyDescriptors$ = OBJECT.getOwnPropertyDescriptors;
/**
 * ```ts
 * Object.defineProperty
 * ```
 * @internal
 * */
export const OBJ_defineProperty$ = OBJECT.defineProperty;
/**
 * ```ts
 * Object.defineProperties
 * ```
 * @internal
 * */
export const OBJ_defineProperties$ = OBJECT.defineProperties;

const { V, E, C, W } = DefPropDec$$;

/**
 * @example
 * ```ts
 * Object.defineProperty(target, key, {
 *   writable: true,
 *   configurable: true,
 *   enumerable: true,
 *   value
 * })
 * ```
 * @beta
 * */
export const defineReadonlyProperty = function (
  target: any,
  key: Exclude<keyof typeof target, number>,
  value: any
) {
  return OBJECT.defineProperty(target, key, {
    [V]: value,
    [W]: true,
    [C]: true,
    [E]: true
  });
};

/**
 * ```ts
 * Object.getPrototypeOf
 * ```
 * @internal
 * */
export const OBJ_getPrototypeOf$ = OBJECT.getPrototypeOf;

/**
 * ```ts
 * Object.getOwnPropertyDescriptor
 * ```
 * @internal
 * */
export const OBJ_getOwnPropertyDescriptor$ = OBJECT.getOwnPropertyDescriptor;

/**
 * ```ts
 * Object.getOwnPropertyNames
 * ```
 * @internal
 * */
export const OBJ_getOwnPropertyNames$ = OBJECT.getOwnPropertyNames;

/**
 * @internal
 */
export const PROMISE = Promise;

/**
 * @internal
 */
export const CREATE_NEW = Reflect.construct;
