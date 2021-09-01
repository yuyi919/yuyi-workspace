import { difference } from "lodash";

/**
 * 判断一个数组是否为另一个数组的子集
 * @param array - 全集
 * @param subArray - 要判断是否为的子集
 * @param strict - 判断是否为真子集
 * @returns 是否为（真）子集
 */

export function isSubArray<T>(array: T[], subArray: T[], strict?: boolean) {
  return (
    array.length - subArray.length > (strict ? 0 : -1) && difference(subArray, array).length === 0
  );
}
