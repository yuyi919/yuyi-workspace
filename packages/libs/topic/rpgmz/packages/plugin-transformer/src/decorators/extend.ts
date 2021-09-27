import { ConstructorType } from "./metaData";
import { overwriteMethod } from "./utils";
import { reaction, IReactionDisposer } from "mobx";

export function createConstructor<T, W>(
  Target: ConstructorType<T>,
  react?: (self: T) => W,
  effect?: (self: T, changed: W, prev?: W) => any
) {
  const result = (refs?: () => ConstructorType<T>) =>
    function (newTarget: any) {
      const inheritPro = refs?.()?.prototype;
      let listener: IReactionDisposer = null;
      for (const [key, { value: override = inheritPro?.[key] }] of Object.entries(
        Object.getOwnPropertyDescriptors(newTarget.prototype)
      )) {
        console.debug(`Yuyi919.proxyMethod(${Target.name}, "${key}")`);
        if (key !== "constructor" && override instanceof Function && override !== result[key]) {
          const sourceDescDesc = Target.prototype[key];
          if (override) {
            overwriteMethod(Target, key as any, (ins, ...args) => {
              // console.log("call override", key)
              if (react && effect && !listener) {
                listener = reaction(
                  () => react(ins),
                  (current, prev) => {
                    effect?.(ins, current, prev);
                  }
                );
              }
              if (!react || react(ins)) {
                result[key] = sourceDescDesc?.bind(ins);
                return override.call(ins, ...args);
              }
              return sourceDescDesc?.call(ins, ...args);
            });
          }
        }
      }
    };
  return result as T & typeof result;
}

export function createStaticConstructor<T extends ConstructorType>(Target: T) {
  const result = () =>
    function (newTarget: any) {
      for (const [key, { value: override }] of Object.entries(
        Object.getOwnPropertyDescriptors(newTarget)
      )) {
        if (
          key !== "name" &&
          key !== "length" &&
          key !== "prototype" &&
          override instanceof Function &&
          override !== result[key]
        ) {
          const sourceDescDesc = Target[key];
          result[key] = sourceDescDesc?.bind(Target);
          if (override) {
            Target[key] = (...args: any[]) => {
              return override.call(Target, ...args);
            };
          }
        }
      }
    };
  return result as T & typeof result;
}
