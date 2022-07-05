import { Types } from "@yuyi919/shared-types";
import { FilterGenerator } from "./utils";

/**
 * @internal
 */
export type isNumber = FilterGenerator<number>;
// const check: isEmptyObject = null;
// check<5>('')

/**
 * @internal
 */
export type isBoolean = FilterGenerator<boolean>;

/**
 * @internal
 */
export type isString = FilterGenerator<string>;

/**
 * @internal
 */
export type isArray = FilterGenerator<Array<any>>;

/**
 * @internal
 */
export type isObject = FilterGenerator<object>;

/**
 * @internal
 */
export type isFunction = FilterGenerator<Types.Function.Base>;

/**
 * @internal
 */
export type isEmptyObject = FilterGenerator<Record<string, never>>;

/**
 * @internal
 */
export type isObjectStrict<T extends {}> = FilterGenerator<T>;

/**
 * @internal
 */
export type isTyped<T> = FilterGenerator<T>;
