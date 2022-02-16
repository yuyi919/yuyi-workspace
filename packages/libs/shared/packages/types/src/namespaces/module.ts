import { Types } from "./";

/**
 * 判断是否是EsModule的导入
 * @alpha
 */
export type EsModuleLike<T, D = any> = T & Types.RecordWithOptionalKey<"default", D>;
/**
 * 判断是否是EsModule的导入
 * @alpha
 */
export type EsModuleLikeWithDefault<T, D = any> = T & Types.RecordWithKey<"default", D>;
/**
 * 判断是否是EsModule的导入
 * @param target - 目标对象
 * @param expectNull - 是否先进行非空判断，默认为true
 * @alpha
 */
export function isEsModule<T>(target: any, expectNull?: boolean): target is EsModuleLike<{}, T> {
  return (
    (!expectNull || target) &&
    (target.__esModule ||
      target[Symbol.toStringTag as unknown as string] === "Module" ||
      Object.prototype.toString.call(target) === "[object Module]")
  );
}

/**
 * 判断是否是包含默认导出的EsModule导入
 * @param target - 目标对象
 * @param expectNull - 是否先进行非空判断，默认为true
 * @alpha
 */
export function isEsModuleWithDefaultExport<T>(
  target: any,
  expectNull?: boolean
): target is EsModuleLikeWithDefault<{}, T> {
  return (!expectNull || target) && "default" in target && isEsModule<T>(target, false);
}

export default isEsModule;
