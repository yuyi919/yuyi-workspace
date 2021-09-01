import { Constant$ } from "@yuyi919/shared-constant";
import { isFunction as isFunctionLodash } from "lodash";
export function isFunction<T extends (...args: any[]) => any>(value: any): value is T {
  return typeof value === Constant$.KEY_FUNC || value instanceof Constant$.FUNCTION;
}
export { isFunctionLodash };
