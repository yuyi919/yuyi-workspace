import { Types } from "@yuyi919/shared-types";

/**
 * 交换对象的key和value
 * @beta
 * @param target -
 */
export function reverseKV<
  Target extends Record<string, any>,
  Result extends Types.Object.ReverseKV<Target>
>(target: Target): Result {
  const r = {} as any;
  for (const key in target) {
    //@ts-ignore
    r[target[key]] = key;
  }
  return r;
}
