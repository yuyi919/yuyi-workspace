import { Constant$ } from "@yuyi919/shared-constant";
import { isFunction as isFunctionLodash } from "lodash";
/**
 * @param target -
 * @beta
 */
export function isFunction<T extends (...args: any[]) => any>(target: any): target is T {
  return typeof target === Constant$.KEY_FUNC || target instanceof Constant$.FUNCTION;
}
export { isFunctionLodash };
