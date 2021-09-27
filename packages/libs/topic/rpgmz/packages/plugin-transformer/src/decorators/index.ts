/* eslint-disable @typescript-eslint/no-explicit-any */ /* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import "reflect-metadata";
import { Transform, TransformationType, deserialize } from "class-transformer";
import {
  defineDefaultMeta,
  getDefaultMeta,
  getDesignTypeMeta,
  ConstructorType,
  PrototypeType,
} from "./metaData";
import env from "./helper";
import { plainToClass, transformToClass } from "./utils";

export const staticEmpty = (target: any, params: string) => {};
/**
 * 过滤默认值
 * @param expect 如果返回true，接受输入值作为默认值，否则取字段定义的默认值
 */
export const DefaultFilter =
  (expect: (value: any, obj: any) => boolean) => (target: PrototypeType, params: string) => {
    Transform((value: any, obj: any, transformationType) => {
      if (transformationType === TransformationType.PLAIN_TO_CLASS) {
        return expect(value, obj)
          ? value
          : getDefaultMeta(target.constructor as ConstructorType)[params];
      }
      return value;
    })(target, params);
  };

/**
 * 给参数添加名称
 * @param name
 */
export const Text = (name: string) => staticEmpty;
/**
 * 参数
 */
export const Param = () => staticEmpty;

export const getHandler = <T>(target?: ConstructorType<T>): T => env.getParameters(target);

export * from "./command";
export * from "./utils";
export * from "./extend";
export * from "./Type";
export * from "./plugins";
export * from "./structs";

export { plainToClass, deserialize, transformToClass };
