/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Types } from "@yuyi919/shared-types";
import "reflect-metadata";

export type MetaOption =
  | ConstructorMetaOption<any[], any>
  | PropertyMetaOption<any[], any>
  | MethodMetaOption<any[], any>;
export type MetaKinds = MetaOption["kind"];
export interface ConfigureMetaOption<S extends any[], T> {
  config?: (
    meta: {
      target: Types.ConstructorType<any>;
      propertyKey?: string;
      descriptor?: TypedPropertyDescriptor<any>;
    },
    ...param: S
  ) => T;
}
export interface ConstructorMetaOption<S extends any[], T> extends ConfigureMetaOption<S, T> {
  kind: "constructor";
  children?: string;
}
export interface PropertyMetaOption<S extends any[], T> extends ConfigureMetaOption<S, T> {
  kind: "property";
}
export interface MethodMetaOption<S extends any[], T> extends ConfigureMetaOption<S, T> {
  kind: "method";
}
export type MetaConfig<T, Name extends string = string, Kind extends MetaKinds = MetaKinds> = {
  name: Name;
  meta: T;
  kind: Kind;
};
function _appendMeta<T>(
  MetaKey: any,
  target: Types.Recordable,
  kind: MetaKinds,
  meta: T,
  propertyKey: string
) {
  const arr: MetaConfig<T>[] = _getMeta(MetaKey, target) || [];
  arr.push({ name: propertyKey, meta, kind });
  Reflect.defineMetadata(MetaKey, arr, target);
}
function _defineMeta<T>(
  MetaKey: any,
  target: Types.ConstructorType<any>,
  meta: T,
  kind: MetaKinds,
  propertyKey?: string
): void {
  Reflect.defineMetadata(
    MetaKey,
    { name: propertyKey || target.name, meta, kind } as MetaConfig<T>,
    target,
    propertyKey
  );
}

function _getMeta(MetaKey: any, target: Types.Recordable, propertyKey?: string): any {
  if (propertyKey) {
    return (Reflect.getMetadata(MetaKey, target) as MetaConfig<any>[])?.find(
      (o) => o.name === propertyKey
    );
  }
  return Reflect.getMetadata(MetaKey, target);
}

/**
 * 创建一组静态元数据的装饰器
 * @param configure 配置项集合
 * @returns
 */
export function createStaticMetaDataDecorators<
  Namespace extends string,
  Config extends Record<string, MetaOption>
>(namespace: Namespace, configure: Config) {
  const metaKeys = {} as Record<keyof Config, symbol>;
  const decorators = {} as {
    [K in keyof Config]: Config[K] extends ConstructorMetaOption<infer S, any>
      ? (...options: S) => ClassDecorator
      : Config[K] extends PropertyMetaOption<infer S, any>
      ? (...options: S) => PropertyDecorator
      : PropertyDecorator;
  };
  function getMeta<K extends keyof Config, Target extends Types.ConstructorType<any>>(
    key: K,
    target: Target
  ): Config[K] extends ConfigureMetaOption<any[], infer T>
    ? Config[K] extends ConstructorMetaOption<any, any> // 根据装饰器类型
      ? MetaConfig<T, string, Config[K]["kind"]>
      : MetaConfig<T, Types.KeyOf<InstanceType<Target>>, Config[K]["kind"]>[]
    : void;
  function getMeta<
    K extends keyof Config,
    Target extends Types.ConstructorType<any>,
    PropertyKey extends keyof InstanceType<Target>
  >(
    key: K,
    target: Target,
    propertyKey: PropertyKey
  ): Config[K] extends ConfigureMetaOption<any[], infer T>
    ? MetaConfig<T, PropertyKey & string, Config[K]["kind"]>
    : void;
  function getMeta(key: keyof Config, target: any, propertyKey?: string): any {
    return _getMeta(metaKeys[key], target, propertyKey);
  }
  const helpers = {
    getMeta,
  };
  for (const key in configure) {
    const meta = configure[key];
    const { kind } = meta;
    const metaKey = (metaKeys[key] = Symbol(namespace + "_meta:" + key));
    if (kind === "property") {
      decorators[key] = function (...args: any[]) {
        return function (target, propertyKey: string) {
          const propertyOpts = meta.config(
            { target: target.constructor as Types.ConstructorType<any>, propertyKey },
            ...args
          );
          _appendMeta(metaKey, target.constructor, kind, propertyOpts, propertyKey);
        } as PropertyDecorator;
      } as any;
    } else if (kind === "constructor") {
      decorators[key] = function (...args: any[]) {
        return function (target: Types.ConstructorType<any>) {
          const propertyOpts = meta.config({ target }, ...args);
          _defineMeta(metaKey, target, propertyOpts, kind);
        } as ClassDecorator;
      } as any;
    }
  }
  return {
    ...decorators,
    ...helpers,
    metaKeys,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform<T extends any>(plain: any, Target: Types.ConstructorType<T>) {
      const result = { ...plain } as T;
      // for (const $Target of [Target].concat(Targets)) {
      // const keys = Object.getOwnPropertyNames($Target.prototype);
      // console.log($Target.name, keys);
      // merge(
      // result,
      // pickBy(plain, (_, key) => {
      // console.log(plain, key);
      // return keys.includes(key) || keys.includes(key.replace(/^.+?\./, ""));
      // })
      // );
      // }
      return result;
    },
  };
}
