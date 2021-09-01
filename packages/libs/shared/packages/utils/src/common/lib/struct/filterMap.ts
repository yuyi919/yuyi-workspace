import { Constant$ } from "@yuyi919/shared-constant";

/**
 *
 * @param arr
 * @param igronFilter
 * @param formatter
 */
export function filterMap<S = string, T = string>(
  arr: any[],
  igronFilter: (value: any) => boolean,
  formatter?: (k: S) => T
) {
  const r: T[] = [];
  let i = -1,
    cr = null,
    j = -1;
  while (++j < arr.length) {
    /* istanbul ignore next */
    if (!igronFilter((cr = formatter ? formatter(arr[j]) : arr[j]))) r[++i] = cr;
  }
  return r;
}

/**
 *
 * @param arr
 * @param igronValue
 * @param formatter
 */
export function filterMapWith<S = string, T = string>(
  arr: any[],
  igronValue: any,
  formatter?: (k: S) => T
) {
  return filterMap(arr, Constant$.CREATE_OBJECT_IS(igronValue), formatter);
}

/**
 *
 * @param target
 * @param filter
 */
export function filterKeys(
  target: Record<string, any>,
  filter: (code: string, value?: any) => boolean
): string[] {
  // eslint-disable-next-line prefer-const
  let r: string[] = [],
    length = -1,
    // eslint-disable-next-line prefer-const
    keys = Object.keys(target),
    keysLength = keys.length,
    i = -1,
    code = null;
  while (++i < keysLength && (code = keys[i])) filter(code, target[code]) && (r[++length] = code);
  return r;
}
