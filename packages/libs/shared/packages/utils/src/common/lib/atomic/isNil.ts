import { isString, trim } from "./lodash";
import { isNil, isNaN } from "@yuyi919/shared-types";
import { NULL } from "@yuyi919/shared-constant";

/**
 * 检查`value`是否为 `null` 或 `undefined`
 * @param value - 检查的`value`
 * @returns 是则返回`true`，不是则返回`false`
 * @example
 * ```
 * isNotNil(null);
 * // => false
 *
 * isNotNil(void 0);
 * // => false
 *
 * isNotNil(NaN);
 * // => true
 * ```
 * @beta
 */
export function isNotNil(value: any): boolean {
  return value != NULL;
}


/**
 * 检查`value`是否不为 `false` `null` 或 `undefined`
 * @param value - 检查的`value`
 * @returns 是则返回`true`，不是则返回`false`
 * @example
 * ```
 * isTruth(null);
 * // => false
 *
 * isTruth(void 0);
 * // => false
 * 
 * isTruth(false);
 * // => false
 *
 * isTruth(true);
 * // => true
 * 
 * isTruth("");
 * // => true
 * 
 * isTruth(0);
 * // => true
 * ```
 * @beta
 */
export function isTruth(value: any): boolean {
  return value != null && value !== false
}

/**
 * 是否为空或异常值，不包括0
 * 空值: null/undefined/''
 * 异常值: NaN
 * 不包括空对象/空数组
 * @param value -
 * @beta
 */
export function isEmptyValue(value: any): value is null | undefined | "" {
  // console.log('isEmptyValue', value, (isString(value) && trim(value) === ''), isNil(value), isNaN(value))
  return (isString(value) && trim(value) === "") || isNil(value) || isNaN(value);
}

/**
 * 是否非空且非异常值，不包括0
 * 空值: null/undefined/''
 * 不包括空对象/空数组
 * @param value -
 * @beta
 */
export function isNotEmptyValue(
  value: any
): value is string | number | boolean | object | Function {
  return !isEmptyValue(value);
}
