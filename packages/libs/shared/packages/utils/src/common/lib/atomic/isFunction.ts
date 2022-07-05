import { KEY_FUNC, FUNCTION } from "@yuyi919/shared-constant";
import { isFunction as isFunctionLodash } from "lodash";
/**
 * @param target -
 * @beta
 */
export function isFunction<T extends (...args: any[]) => any>(target: any): target is T {
  return typeof target === KEY_FUNC || target instanceof FUNCTION;
}
export { isFunctionLodash };
