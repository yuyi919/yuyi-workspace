/**
 * @module CustomUtils
 */
import { differenceWith, isEqual } from "../atomic";
import { Comparator2 } from "lodash";

/**
 *
 * @param listA -
 * @param listB -
 * @param deep -
 * @alpha
 */
export function getListDifferent(listA: any[], listB: any[], deep = false) {
  return {
    push: differenceWith(
      listB,
      listA,
      deep ? (a, b) => isEqual(a, b) : ([] as unknown as Comparator2<any, any>)
    ),
    pull: differenceWith(
      listA,
      listB,
      deep ? (a, b) => isEqual(a, b) : ([] as unknown as Comparator2<any, any>)
    )
  };
}
