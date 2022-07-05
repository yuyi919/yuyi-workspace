import { getTypeTag } from "..";
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
