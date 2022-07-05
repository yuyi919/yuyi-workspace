import { KEY_NUM } from "@yuyi919/shared-constant";

/**
 * 检查一个值是否为数字
 * @param value - 检查对象
 * @param allowNaN - 是否允许NaN(默认不允许)
 * @returns - 返回true/false
 * @public
 */
export function checkNumber(value: any, allowNaN?: true): value is number {
  return typeof value === KEY_NUM && (allowNaN === true || value === value);
}
