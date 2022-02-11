import type Types from ".";

const types = [
  "boolean",
  "number",
  "string",
  "function",
  "array",
  "date",
  "regExp",
  "object",
  "error",
  "symbol",
] as const;
export type BuiltinTypes = typeof types[number] | "null" | "NaN" | "undefined" | "bigint";
const class2type = {} as Record<string, BuiltinTypes>;

for (const type of types) {
  class2type[`[object ${type}]`] = type;
}

export function getType(object: unknown): BuiltinTypes {
  const type = Object.toString.call(object) as string;
  if (object === null) return "null";
  if (typeof object === "number" && object !== object) return "NaN";

  const isObject = typeof object === "object";
  const isFn = typeof object === "function";
  return isObject || isFn ? class2type[type] || "object" : typeof object;
}

export function isPrimitive(tar: unknown): tar is string | number {
  return isNum(tar) || typeof tar === "string";
}
export function isArr<T>(tar: unknown): tar is T[] {
  return getType(tar) === "array";
}
export function isNum(tar: unknown): tar is number {
  return typeof tar === "number" && tar === tar;
}
export function isStr(tar: unknown): tar is string {
  return typeof tar === "string";
}
export function isObj(tar: unknown): tar is object {
  return getType(tar) === "object";
}
export function isFn<Func extends (...data: any) => any = (...data: any) => any>(
  tar: unknown
): tar is Func {
  return typeof tar === "function" && "call" in tar;
}
export function isUndefined(tar: unknown): tar is undefined {
  return tar === void 0;
}
export function isNull(tar: unknown): tar is null {
  return tar === null;
}

export function isEmpty(tar: unknown): boolean {
  const t = getType(tar);
  switch (t) {
    case "object":
      return Object.keys(tar as Types.Recordable).length === 0;
    case "array":
      return (tar as any[]).length === 0;
    case "string":
      return !(tar as string).trim();
    case "undefined":
    case "null":
    case "NaN":
    case "boolean":
      return true;
    default:
      return false;
  }
}
export function isNil(tar: unknown): tar is null | undefined {
  return tar === void 0 || tar === null;
}
export function isNaN(tar: unknown): boolean {
  return typeof tar === "number" && tar !== tar;
}
