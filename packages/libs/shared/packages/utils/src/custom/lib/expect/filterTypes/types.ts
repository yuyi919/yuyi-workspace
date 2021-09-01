import { Types } from "@yuyi919/shared-types";
import { FilterGenerator } from "./utils";

export type isNumber = FilterGenerator<number>;

// const check: isEmptyObject = null;
// check<5>('')

export type isBoolean = FilterGenerator<boolean>;

export type isString = FilterGenerator<string>;

export type isArray = FilterGenerator<Array<any>>;

export type isObject = FilterGenerator<object>;

export type isFunction = FilterGenerator<Types.Function.Base>;

export type isEmptyObject = FilterGenerator<Record<string, never>>;

export type isObjectStrict<T extends {}> = FilterGenerator<T>;

export type isTyped<T> = FilterGenerator<T>;
