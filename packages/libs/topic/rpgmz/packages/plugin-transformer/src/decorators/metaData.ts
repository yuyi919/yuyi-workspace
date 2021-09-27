import type { ArgsTransformer } from "./command";

export type ConstructorType<T = any> = new (...args: any[]) => T;
export type PrototypeType = Record<string, any> & { constructor: ConstructorType<any> | Function };
export const MetaDataKey = {
  Command: Symbol("x.Command"),
  Params: Symbol("x.Params"),
  PluginOptionMeta: Symbol("x.Plugin"),
};

export type PluginOptions = {
  reactive?: boolean;
};
export function definePluginMeta(Target: ConstructorType, options: PluginOptions) {
  Reflect.defineMetadata(MetaDataKey.PluginOptionMeta, options, Target);
  // console.log("definePluginMeta", Target, options);
}
export function getPluginMeta(Target: ConstructorType) {
  const options = Reflect.getMetadata(MetaDataKey.PluginOptionMeta, Target) as PluginOptions;
  // console.log("getPluginMeta", Target, options);
  return options;
}

export function defineCommandMeta(
  target: PrototypeType,
  key: string | symbol,
  value: ArgsTransformer
) {
  Reflect.defineMetadata(MetaDataKey.Command, value, target, key);
}
export function getCommandMeta(target: PrototypeType, key: string | symbol) {
  return Reflect.getMetadata(MetaDataKey.Command, target, key) as ArgsTransformer;
}
export function defineDefaultMeta<T>(target: ConstructorType<T>, value: T) {
  Reflect.defineMetadata(MetaDataKey.Command, value, target);
}
export function getDefaultMeta<T>(target: ConstructorType<T>) {
  return Reflect.getMetadata(MetaDataKey.Command, target) as T;
}

export function getDesignTypeMeta<T extends Record<string, any>>(
  Target: ConstructorType<T>,
  key?: keyof T
): ConstructorType {
  return Reflect.getMetadata("design:type", Target.prototype, key as string);
}

type ParamDefine = {
  name: string;
  type: () => ConstructorType<any>;
};
export function appendParamsMeta(target: Object, name: string, type: () => ConstructorType<any>) {
  const arr: ParamDefine[] = getParamsMeta(target) || [];
  arr.push({ name: name, type });
  Reflect.defineMetadata(MetaDataKey.Params, arr, target);
}
export function getParamsMeta(target: Object) {
  return Reflect.getMetadata(MetaDataKey.Params, target) as ParamDefine[];
}
