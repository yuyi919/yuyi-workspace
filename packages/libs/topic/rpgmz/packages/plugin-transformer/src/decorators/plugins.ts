import {
  defineCommandMeta,
  getCommandMeta,
  ConstructorType,
  PluginOptions,
  definePluginMeta,
} from "./metaData";
import { autoExtendConstructor } from "./extendCls";
import { logger, setupInitialValue } from "./utils";

const plugins = [];
export const Plugin = (options?: PluginOptions) => (Target: ConstructorType) => {
  const emitInitial = setupInitialValue(Target);
  const superProto = Target.prototype;
  const descriptors = Object.getOwnPropertyDescriptors(superProto) || {};
  const newClass = autoExtendConstructor(
    Target,
    (target, args) => {
      emitInitial(target);
      for (const key in descriptors) {
        const Command = getCommandMeta(superProto, key);
        if (Command) {
          defineCommandMeta(target, key, Command);
          logger.log(`${Target.name} load command ${key}`);
        }
      }
    },
    (rename) => "P" + rename
  );
  if (options) {
    definePluginMeta(newClass, options);
  }
  Reflect.defineMetadata("sourceType", Target, newClass);
  return newClass;
};
