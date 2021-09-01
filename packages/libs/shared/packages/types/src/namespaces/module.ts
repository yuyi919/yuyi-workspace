import { Types } from "./";

export type EsModule<T, D = any> = T & Types.RecordWithOptionalKey<"default", D>;
export type EsModuleWithDefault<T, D = any> = T & Types.RecordWithKey<"default", D>;
/**
 * 判断是否是EsModule的导入
 * @param target
 * @param expectNull 是否先进行非空判断，默认为true
 */
export function isEsModule<T>(target: any, expectNull?: boolean): target is EsModule<{}, T> {
  return (
    (!expectNull || target) &&
    (target.__esModule || target[Symbol.toStringTag as unknown as string] === "Module" ||
      Object.prototype.toString.call(target) === "[object Module]")
  );
}

/**
 * 判断是否是包含默认导出的EsModule导入
 * @param target
 * @param expectNull 是否先进行非空判断，默认为true
 */
export function isEsModuleWithDefaultExport<T>(
  target: any,
  expectNull?: boolean
): target is EsModuleWithDefault<{}, T> {
  return (
    (!expectNull || target) &&
    "default" in target &&
    isEsModule<T>(target, false)
  );
}
