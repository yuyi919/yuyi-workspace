export * from "./lib/changeKeys";
export * from "./lib/expect";
export * from "./lib/uuid";

export function sortKeyArray(keys: string[]) {
  return keys.sort((a, b) => a.localeCompare(b));
}
export function sortKeys<T extends Record<string, any>>(target: T): T {
  const returnObj = {} as T;
  for (const key of sortKeyArray(Object.keys(target))) {
    returnObj[key as keyof T] = target[key];
  }
  return returnObj;
}
