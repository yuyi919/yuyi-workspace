import { createObjectIs } from "../atomic";

/**
 *
 * @param arr -
 * @param igronFilter -
 * @param formatter -
 * @alpha
 */
export function filterMap<S = string, T = string>(
  arr: any[],
  igronFilter: (value: any) => boolean,
  formatter?: (k: S) => T
) {
  const r: T[] = [];
  let i = -1,
    cr: T,
    j = -1;
  while (++j < arr.length) {
    /* istanbul ignore next */
    if (!igronFilter((cr = formatter ? formatter(arr[j]) : arr[j]))) r[++i] = cr;
  }
  return r;
}

/**
 *
 * @param arr -
 * @param igronValue -
 * @param formatter -
 * @alpha
 */
export function filterMapWith<S = string, T = string>(
  arr: any[],
  igronValue: any,
  formatter?: (k: S) => T
) {
  return filterMap(arr, createObjectIs(igronValue), formatter);
}

/**
 *
 * @param target -
 * @param filter -
 * @alpha
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
    // eslint-disable-next-line prefer-const
    keysLength = keys.length,
    i = -1,
    code: string;
  while (++i < keysLength && (code = keys[i])) filter(code, target[code]) && (r[++length] = code);
  return r;
}
