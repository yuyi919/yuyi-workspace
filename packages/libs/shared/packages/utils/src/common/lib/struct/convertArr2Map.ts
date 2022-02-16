import { IKeyValueMap, TKey } from "@yuyi919/shared-types";
import { Constant$ } from "@yuyi919/shared-constant";
import { isObject, map, Setter } from "../atomic";

const { REDUCE } = Constant$;

/**
 * @param obj -
 * @param defineKey -
 * @deprecated TODO
 * @beta
 */
export function convertMap2UnieqArray<
  Target extends {},
  Keys extends string,
  Map extends { [k in Keys]: Target },
  PrimaryKey extends string = "key"
>(
  obj: Map,
  defineKey: PrimaryKey = "key" as PrimaryKey
): ({
  [Key in keyof Target | PrimaryKey]?: Key extends keyof Target ? Target[Key] : Keys;
} & { [key: string]: any })[] {
  return obj instanceof Array ? obj : map(obj, (r, key) => Setter.setValue$$(r, defineKey, key));
}
/**
 * @param stringArray -
 * @beta
 * @deprecated TODO
 */
export function convertArr2Map(stringArray: string[]): IKeyValueMap<true> {
  return stringArray ? (REDUCE(stringArray, Setter.setTrue$$, {}) as any) : {};
}

/**
 * @internal
 * @deprecated TODO
 */
export function getSafeMapOptions(
  options?: string[] | IKeyValueMap<boolean>,
  defaultValue?: IKeyValueMap<boolean>
): IKeyValueMap<boolean> {
  return Constant$.IS_ARR(options)
    ? convertArr2Map(options as string[])
    : isObject(options)
    ? (options as IKeyValueMap<boolean>)
    : defaultValue;
}

/**
 * @deprecated TODO
 * @alpha
 */
export function convertKeys2ValuesMap<O extends IKeyValueMap<string>>(
  obj: O
): { [K in O[keyof O]]: K } {
  return obj ? (REDUCE(Object.entries(obj), Setter.setWithEntriesReverse$$, {}) as any) : {};
}

/**
 * 将下拉OptionList转化为
 *```ts
 * Map<VALUE, LABEL>
 *```
 * 用于快速翻译查表
 * @param arr -
 * @param labelKey -
 * @param valKey -
 * @alpha
 * @deprecated TODO
 */
export function convertOptions2Map<T extends IKeyValueMap>(
  arr: T[],
  labelKey: TKey = "label",
  valKey: TKey = "value"
): IKeyValueMap {
  return REDUCE(arr, (r, i) => Setter.setWith$$(r, i, valKey, labelKey), {});
}
