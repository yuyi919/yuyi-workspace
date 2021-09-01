import { isEqual as _eq } from "lodash";
import { isNotEmptyValue } from "./isNil";

/**
 * 深比较两个值是否相等
 * @param value - 比较值
 * @param other - 另一个值
 * @param noStrict - 启用非严格模式(默认为false)，null和undefined视为相等
 * @returns 如果两个值完全相同，那么返回true，否则返回false。
 * @example
 * const object = { 'a': 1 };
 * const other = { 'a': 1 };
 *
 * LodashExtraUtils.isEqual(object, other);
 * // => true
 * object === other;
 * // => false
 *
 * @remarks \
 * NOTE:
 * # **注意**.
 * 这个方法支持比较 arrays, array buffers, booleans, date objects, error objects, maps, numbers, Object objects, regexes, sets, strings, symbols, 以及 typed arrays. Object 对象值比较自身的属性，不包括继承的和可枚举的属性。 不支持函数和DOM节点比较。
 */
export function isEqual(value: any, other: any, noStrict = false): boolean {
  if (noStrict) {
    const value1 = isNotEmptyValue(value) ? value : undefined;
    const value2 = isNotEmptyValue(other) ? other : undefined;
    return value1 === value2 || _eq(value1, value2);
  } else {
    return _eq(value, other);
  }
}
isEqual._ = _eq;

/**
 * @remarks see:  {@link https://www.lodashjs.com/docs/latest#_isequalvalue-other}
 */
export { _eq };
