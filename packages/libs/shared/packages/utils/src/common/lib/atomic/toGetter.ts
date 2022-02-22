import { get as getDeep } from "./lodash";

function get<T, K extends keyof T>(target: T, key: K, defaultValue?: any): T[K] {
  const v = target[key];
  return v === undefined ? defaultValue : v;
}

/**
 *
 * @param target -
 * @param key -
 * @param defaultValue -
 * @alpha
 */
export function toGetter<T, K extends keyof T>(target: T, key: K, defaultValue?: any): () => T[K] {
  // @ts-ignore
  return get.bind(null, target, key, defaultValue);
}

/**
 *
 * @param target -
 * @param key -
 * @param defaultValue -
 * @alpha
 */
export function toDeepGetter<T, K extends keyof T>(
  target: T,
  key: K,
  defaultValue?: any
): () => T[K] {
  return getDeep.bind(null, target, key, defaultValue);
}
