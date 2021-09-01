import { find, isEqual, isNil, isArray } from "../atomic";

function isLikeArray(array: any[], other: any[]) {
  if (array.length !== other.length) return false;
  for (const v of array) {
    if (isNil(find(other, (item: any) => isEqual(item, v)))) {
      return false;
    }
  }
  return true;
}

/**
 * 判断两个数组是否相似
 * @param target - 原数组
 * @param other - 比较数组
 * @remarks
 * # **注意**
 * 该方法的比较是相似而非相等
 * @example
 *```ts
 * likeArray([1, 2, 3, 4], [4, 3, 2, 1])
 *```=> true
 */
export function likeArray(target: any[], other: any[]) {
  // if the other array is a falsy value, return
  if (isArray(other) && isArray(target)) {
    return isLikeArray(target, other);
  }
  return false;
}

/**
 * 判断两个值是否近似相等
 * 对于数组，判断是否数组元素无序相等
 * 对于对象，无序判断是否有相同的key以及相同的value
 * 其余判断是否全等
 * @param target
 * @param other
 */
export function isLikeEquals(target: any, other: any) {
  return target === other || likeArray(target, other);
}
