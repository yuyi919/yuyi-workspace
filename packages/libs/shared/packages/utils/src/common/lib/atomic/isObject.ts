import { isObject } from "./lodash";
import { isPlainObject } from "lodash";

export function isPureObj<T = object>(target: any): target is T {
  return isObject(target) && !(target instanceof Array) && !(target instanceof Function)
    ? true
    : false;
}

export { isPlainObject };
