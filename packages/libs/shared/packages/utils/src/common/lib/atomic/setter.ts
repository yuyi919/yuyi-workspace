import { TKey } from "@yuyi919/shared-types";
/**
 * 设置目标map或对象属性并返回目标自身
 * @param target -
 * @param source -
 * @param keywordKey -
 * @param keywordVal -
 * @internal
 */
export function setWith$$<T extends {} | Map<any, any>>(
  target: T,
  source: any,
  keywordKey: TKey,
  keywordVal: TKey
): T {
  return (
    target instanceof Map
      ? target.set(source[keywordKey], source[keywordVal])
      : (target[source[keywordKey]] = source[keywordVal]),
    target
  );
}

/**
 * @internal
 */
export function setWithEntries$$<T>(o: T, option: [string, string]): T {
  return setWith$$(o, option, 0, 1);
}

/**
 * @internal
 */
export function setWithEntriesReverse$$<T, K extends string, V extends string>(
  o: T,
  option: [K, V]
): T {
  return setWith$$(o, option, 1, 0);
}

/**
 * @internal
 */
export function setValue$$<T>(o: T, key: TKey, value: any): T {
  return (o[key] = value), o;
}

/**
 * @internal
 */
export function setTrue$$<T>(o: T, key: TKey): T {
  return (o[key] = true) && o;
}

/**
 * @internal
 */
export function setWithKeyValue$$<T>(target: T, source: { key: any; value: any }): T {
  return (target[source.key] = source.value), target;
}
/**
 * @internal
 */
export function setWithValueLabel$$<T>(target: T, source: { label: any; value: any }): T {
  return (target[source.value] = source.label), target;
}
/**
 * @internal
 */
export function setWithLabelValue$$<T>(target: T, source: { label: string; value: any }): T {
  return (target[source.label] = source.value), target;
}
