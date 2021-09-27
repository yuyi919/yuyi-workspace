import { ConstructorType } from "./metaData";
import { autoExtendConstructor } from "./extendCls";
import { setupInitialValue } from "./utils";

const structs = [];
export const Struct = () => (Target: ConstructorType) => {
  const emitInitial = setupInitialValue(Target);
  const newClass = autoExtendConstructor(
    Target,
    (target, args) => {
      emitInitial(target);
    },
    (rename) => "T" + rename
  );
  Reflect.defineMetadata("sourceType", Target, newClass);
  return newClass;
};
