/**
 * 实用工具
 * @packageDocumentation
 */

export * from "./atomic";
export * from "./struct";
export * from "./async";

export function extendMap<T extends Map<any, any>>(...map: T[]): T {
  let r = [] as [string, any][];
  for (const o of map) {
    if (o) {
      r = r.concat(Array.from(o.entries()));
    }
  }
  return new Map(r) as T;
}
