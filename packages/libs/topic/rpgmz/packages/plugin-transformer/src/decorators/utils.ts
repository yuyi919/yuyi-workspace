import { createLogger } from "@yuyi919/shared-logger";
import { plainToClass as TplainToClass } from "class-transformer";
import { defaults } from "lodash";
import { isObservable, makeObservable } from "mobx";
import {
  ConstructorType,
  defineDefaultMeta,
  getDefaultMeta,
  getDesignTypeMeta,
  getParamsMeta,
  getPluginMeta,
} from "./metaData";

export const logger = createLogger("Plugin", { stack: false });

export function proxyMethod<
  T extends any,
  K extends keyof T,
  Args extends T[K] extends (...args: infer Arg) => any ? Arg : [],
  Result extends T[K] extends (...args: any[]) => infer R ? R : []
>(
  target: { new (...args: any[]): T },
  methodName: K,
  hacker: (
    target: T,
    sourceHandle: OmitThisParameter<(...args: Args) => Result>,
    ...args: Args
  ) => any
) {
  const handle: (...args: Args) => any = target.prototype[methodName];
  target.prototype[methodName] = function (...args: Args) {
    return hacker.apply(this, [this, handle.bind(this), ...args] as [
      T,
      OmitThisParameter<(...args: Args) => Result>,
      ...Args
    ]);
  };
}
export function overwriteMethod<
  T extends any,
  K extends keyof T,
  Args extends T[K] extends (...args: infer Arg) => any ? Arg : [],
  Result extends T[K] extends (...args: any[]) => infer R ? R : []
>(
  target: { new (...args: any[]): T },
  methodName: K,
  hacker: (target: T, ...args: Args) => Result
) {
  target.prototype[methodName] = function (...args: Args) {
    return hacker.apply(this, [this, ...args] as [T, ...Args]);
  };
}

export function proxyMethodAfter<
  T extends { new (...args: any[]): any },
  K extends keyof InstanceType<T>,
  Args extends InstanceType<T>[K] extends (...args: infer Arg) => any ? Arg : [],
  Result extends InstanceType<T>[K] extends (...args: any[]) => infer R ? R : []
>(
  target: T,
  methodName: K,
  hacker: (target: InstanceType<T>, result: Result, ...args: Args) => any
) {
  const handle: (...args: Args) => any = target.prototype[methodName];
  target.prototype[methodName] = function (...args: Args) {
    const result: Result = handle.apply(this, args);
    return hacker.apply(this, [this, result, ...args] as [T, Result, ...Args]);
  };
}

export function plainToClass<T extends Record<string, any>>(
  target: ConstructorType<T>,
  initial: Record<string, any>
): T {
  return TplainToClass(target, initial, { enableImplicitConversion: true });
}

function _transformToClass<T extends Record<string, any>>(
  Target: ConstructorType<T>,
  target: Record<string, any>,
  parent?: ConstructorType<T>
) {
  const superProto = Target.prototype;
  for (const { name, type } of getParamsMeta(superProto) || []) {
    logger.log(
      `[Struct] ${Target.name}: load Class ${type().name} - ${[
        parent && `[Class: ${parent.name}]`,
        name,
      ]
        .filter(Boolean)
        .join(".")}`
    );
    const typeCls = type();
    const cls = getDefault(Target, name, typeCls, target[name]);
    _transformToClass(typeCls, cls, Target);
    target[name] = cls;
  }
}
export function transformToClass<T extends Record<string, any>>(
  Target: ConstructorType<T>,
  target: Record<string, any>
): T {
  _transformToClass(Target, target);
  const cls = plainToClass(Target, target);
  const options = getPluginMeta(Target);
  if (options?.reactive && !isObservable(cls)) {
    makeObservable(cls);
  }
  return cls;
}

export function getDefault(
  Target: ConstructorType,
  key: string,
  typeDto: ConstructorType,
  value: any
) {
  if (typeDto !== String && typeof value === "string") {
    return getDefault(Target, key, typeDto, JSON.parse(value));
  } else if (value instanceof Array) {
    return value.map((value: string | object) => getDefault(Target, key, typeDto, value));
  } else if (value instanceof Object) {
    return value;
  } else if (value === void 0 || value === null) {
    const metaType = Reflect.getMetadata("sourceType", Target) || typeDto;
    const definedDefault = getDefaultMeta(metaType)[key];
    if (typeDto instanceof Function && typeDto !== Object) {
      const designType = getDesignTypeMeta(Target, key);
      value = definedDefault || (designType === Array ? [{}] : {});
    } else {
      return definedDefault;
    }
  }
  return getDefault(Target, key, typeDto, value);
}

export function setupInitialValue<T>(Target: ConstructorType<T>) {
  const initialValue = new Target();
  defineDefaultMeta(Target, initialValue);
  logger.debug(`${Target.name}: defineMeta defaultValues`, initialValue);
  for (const key of Object.getOwnPropertyNames(initialValue)) {
    if (initialValue[key] === void 0) {
      try {
        const meta = getDesignTypeMeta(Target, key as keyof T);
        if (meta === Array) {
          initialValue[key] = [];
        } else if (
          meta instanceof Function &&
          !([Number, String, Symbol, Function] as Function[]).includes(meta)
        ) {
          initialValue[key] = meta === Boolean ? false : plainToClass(meta, {});
        }
      } catch (error) {
        // console.error(Target.name, key, error);
      }
    }
  }
  return (target: T) => {
    defaults(target, getDefaultMeta(Target));
  };
}
