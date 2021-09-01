import { toGetter } from "./toGetter";

export function defineProperties<T, V>(
  target: T,
  values: V,
  options?: Pick<Partial<PropertyDescriptor>, "configurable" | "enumerable">
): T & V {
  const descs: any = {};
  for (const key in values) {
    descs[key] = {
      value: Object.freeze(values[key]),
      writable: false,
      ...(options || {}),
    };
  }
  return Object.defineProperties(target, descs) as any;
}

export function defineGetters<T, G>(target: T, values: G): T & G {
  const descs: any = {};
  for (const key in values) {
    descs[key] = { get: toGetter(values, key) };
  }
  return Object.defineProperties(target as any, descs) as any;
}
