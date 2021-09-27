import { Type as CType } from "class-transformer";
import { appendParamsMeta, ConstructorType, PrototypeType } from "./metaData";
import { staticEmpty } from "./index";

export type RMMZPluginParamType =
  | "string"
  | "number"
  | "boolean"
  | "file"
  | "select"
  | "actor"
  | "variable"
  | "switch";

/**
 * 注入构造函数类型元数据
 * 如果字段类型为数组，会自动反射数组成员（如果没有提供值，默认反射为只包含一个类型反射对象的数组）
 * @param type
 */
export const Type = (type: RMMZPluginParamType | (() => ConstructorType)) => {
  if (type instanceof Function)
    return ((target: PrototypeType, propertyName: string) => {
      appendParamsMeta(target, propertyName, type);
      CType(type)(target, propertyName);
    }) as PropertyDecorator;
  // if (type instanceof Object) return staticEmpty;
  return staticEmpty;
};
