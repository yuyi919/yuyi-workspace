import { ARRAY, IS_ARR } from "@yuyi919/shared-constant";
import { IKeyValueMap } from "@yuyi919/shared-types";
import { isString } from "lodash";
import { ARR_PUSH, isFunction, REDUCE } from "../atomic";

/**
 * 根据条件将一个数组拆分为多个数组
 * @param list - 源数组
 * @param keyOrWith - 分组关键字或方法（返回一个关键字）
 * @typeParam T - 原数组的成员类型（必须为Object）
 * @returns 返回一个新对象
 * @remarks
 * 更复杂的控制参照{@link https://www.lodashjs.com/docs/latest#_groupbycollection-iteratee_identity | Lodash.groupBy}
 * TODO
 * @beta
 */
export function createGroupWith<T extends object = any>(
  list: T[],
  keyOrWith: string | ((item: T) => string)
): IKeyValueMap<T[]> {
  if (list instanceof ARRAY && list.length > 0) {
    return REDUCE(
      list,
      function (map, item) {
        const mapKey = isString(keyOrWith)
          ? item[keyOrWith]
          : isFunction(keyOrWith)
          ? keyOrWith(item)
          : "default";
        IS_ARR(map[mapKey])
          ? ARR_PUSH(map[mapKey], item)
          : (map[mapKey] = [item]);
        return map;
      },
      {}
    );
  }
  return {};
}
