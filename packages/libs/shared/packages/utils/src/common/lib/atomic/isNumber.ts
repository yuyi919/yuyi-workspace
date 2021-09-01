import { Constant$ } from "@yuyi919/shared-constant";

export function isNaN(value: any) {
  return typeof value === "number" && value !== value;
}
// (global as any).isNaN = isNaN

const { KEY_NUM } = Constant$;

/**
 * 判断一个值是否为数字
 * @param value — 检查对象
 * @param allowNaN 是否允许NaN(默认不允许)
 * @returns — 返回true/false
 */
export function isNumber(value: any, allowNaN?: true): value is number {
  return typeof value === KEY_NUM && (allowNaN === true || value === value);
}

function _isNum(value: any): value is number {
  return typeof value === KEY_NUM;
}

export function isNumStrict(value: any): value is number {
  return typeof value === KEY_NUM && value === value;
}

/**
 * 判断一个值是否为数字
 * @param value — 检查对象
 * @param allowNaN 是否允许NaN(默认不允许)
 * @returns — 返回true/false
 */
export function isNum(value: any, allowNaN?: true): value is number {
  // return isNumberLodash(value) && (allowNaN || !isNaN(value));
  return allowNaN === true ? _isNum(value) : isNumStrict(value);
}
// /**
//  * 判断一个值是否为数字
//  * @param value — 检查对象
//  * @param allowNaN 是否允许NaN(默认不允许)
//  * @returns — 返回true/false
//  */
// export function isNum2(value: any, allowNaN?: true): value is number {
//   // return isNumberLodash(value) && (allowNaN || !isNaN(value));
//   return allowNaN && _isNum(value) || isNumStrict(value);
// }
