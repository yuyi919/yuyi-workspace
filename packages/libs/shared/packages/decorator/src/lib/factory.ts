import type { ConstructorType as New, InstanceKey, Recordable, Types } from "@yuyi919/shared-types";
import "reflect-metadata";

/**
 * @public
 */
export type MetaOption =
  | IConstructorMetaOption<any[], any>
  | IPropertyMetaOption<any[], any>
  | IMethodMetaOption<any[], any>;

type MetaKind = MetaOption["kind"];

/**
 * @public
 */
export interface IConfigureMetaOption<S extends any[], T> {
  config: (
    meta: {
      target: New<any>;
      propertyKey?: string;
      descriptor?: TypedPropertyDescriptor<any>;
    },
    ...param: S
  ) => T;
}

/**
 * @public
 */
export interface IConstructorMetaOption<S extends any[], T> extends IConfigureMetaOption<S, T> {
  kind: "constructor";
  children?: string;
}
/**
 * @public
 */
export interface IPropertyMetaOption<S extends any[], T> extends IConfigureMetaOption<S, T> {
  kind: "property";
}
/**
 * @public
 */
export interface IMethodMetaOption<S extends any[], T> extends IConfigureMetaOption<S, T> {
  kind: "method";
}
/**
 * @public
 */
export interface IMetaConfig<T, Name extends string = string, Kind extends MetaKind = MetaKind> {
  name: Name;
  meta: T;
  kind: Kind;
}
function _appendMeta<T>(
  metaKey: any,
  target: Recordable,
  kind: MetaKind,
  meta: T,
  propertyKey: string
) {
  const arr: IMetaConfig<T>[] = _getMeta(metaKey, target) || [];
  arr.push({ name: propertyKey, meta, kind });
  Reflect.defineMetadata(metaKey, arr, target);
}
function _defineMeta<T>(
  metaKey: any,
  target: New<any>,
  meta: T,
  kind: MetaKind,
  propertyKey?: string
): void {
  Reflect.defineMetadata(
    metaKey,
    { name: propertyKey || target.name, meta, kind } as IMetaConfig<T>,
    target,
    propertyKey!
  );
}

function _getMeta(metaKey: any, target: Recordable, propertyKey?: string): any {
  if (propertyKey) {
    return (Reflect.getMetadata(metaKey, target) as IMetaConfig<any>[])?.find(
      (o) => o.name === propertyKey
    );
  }
  return Reflect.getMetadata(metaKey, target);
}

/**
 * @public
 */
export interface IStaticMetaDecoratorHelper<Config extends Recordable<MetaOption>> {
  getMeta<K extends keyof Config, Target extends New<any>>(
    key: K,
    target: Target
  ): Config[K] extends IConfigureMetaOption<any[], infer T>
    ? Config[K] extends IConstructorMetaOption<any, any> // 根据装饰器类型
      ? IMetaConfig<T, string, Config[K]["kind"]>
      : IMetaConfig<T, Types.KeyOf<InstanceType<Target>>, Config[K]["kind"]>[]
    : void;
  getMeta<K extends keyof Config, Target extends New<any>, PropertyKey extends InstanceKey<Target>>(
    key: K,
    target: Target,
    propertyKey: PropertyKey
  ): Config[K] extends IConfigureMetaOption<any[], infer T>
    ? IMetaConfig<T, PropertyKey & string, Config[K]["kind"]>
    : void;
  metaKeys: Record<keyof Config, symbol>;
  transform<T extends unknown>(plain: any, Target: New<T>): T;
}

/**
 * @public
 */
export type MetaDataDecorator<
  Config extends Recordable<MetaOption>,
  K extends keyof Config
> = Config[K] extends IConstructorMetaOption<infer S, any>
  ? (...options: S) => ClassDecorator
  : Config[K] extends IPropertyMetaOption<infer S, any>
  ? (...options: S) => PropertyDecorator
  : PropertyDecorator;

/**
 * @public
 */
export type MetaDataDecorators<Config extends Recordable<MetaOption>> = {
  [K in keyof Config]: MetaDataDecorator<Config, K>;
};

/**
 * @public
 */
export type StaticMetaDataDecorators<Config extends Recordable<MetaOption>> =
  MetaDataDecorators<Config> & IStaticMetaDecoratorHelper<Config>;

/**
 * 创建一组静态元数据的装饰器
 * @param namespace - 命名空间
 * @param configure - 配置项集合
 * @public
 */
export function createStaticMetaDataDecorators<Config extends Recordable<MetaOption>>(
  namespace: string,
  configure: Config
): StaticMetaDataDecorators<Config> {
  const metaKeys = {} as Record<keyof Config, symbol>;
  const decorators = {} as MetaDataDecorators<Config>;
  function getMeta<K extends keyof Config, Target extends New<any>>(
    key: K,
    target: Target
  ): Config[K] extends IConfigureMetaOption<any[], infer T>
    ? Config[K] extends IConstructorMetaOption<any, any> // 根据装饰器类型
      ? IMetaConfig<T, string, Config[K]["kind"]>
      : IMetaConfig<T, Types.KeyOf<InstanceType<Target>>, Config[K]["kind"]>[]
    : void;
  function getMeta<
    K extends keyof Config,
    Target extends New<any>,
    PropertyKey extends keyof InstanceType<Target>
  >(
    key: K,
    target: Target,
    propertyKey: PropertyKey
  ): Config[K] extends IConfigureMetaOption<any[], infer T>
    ? IMetaConfig<T, PropertyKey & string, Config[K]["kind"]>
    : void;
  function getMeta(key: keyof Config, target: any, propertyKey?: string): any {
    return _getMeta(metaKeys[key], target, propertyKey);
  }
  const helpers = {
    getMeta
  };
  for (const key in configure) {
    const meta = configure[key];
    const { kind } = meta;
    const metaKey = (metaKeys[key] = Symbol(namespace + "_meta:" + key));
    if (kind === "property") {
      decorators[key] = function (...args: any[]) {
        return function (target, propertyKey: string) {
          const propertyOpts = meta.config(
            { target: target.constructor as New<any>, propertyKey },
            ...args
          );
          _appendMeta(metaKey, target.constructor, kind, propertyOpts, propertyKey);
        } as PropertyDecorator;
      } as any;
    } else if (kind === "constructor") {
      decorators[key] = function (...args: any[]) {
        return function (target: New<any>) {
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
    transform<T extends any>(plain: any, Target: New<T>) {
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
    }
  };
}
