/* eslint-disable prefer-const */
/* eslint-disable no-var */
import * as helpers from "./helpers";
export function safeExtendConstructor<Args extends any[], T extends new (...args: Args) => any>(
  Target: T,
  extend: (target: InstanceType<T>, args: Args) => any,
  rename?: string | ((name: string) => string)
) {
  if (extend instanceof Function) {
    const newTargeName =
      (rename && (rename instanceof Function ? rename(Target.name) : rename)) || Target.name;
    let newCls: typeof Target;
    var { extendFunc, inheritsClass, createSuperCls } = helpers;
    // @ts-ignore
    // eslint-disable-next-line prefer-const
    eval(`
newCls = function ${newTargeName}() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  return extendFunc(this, _super, args, extend);
}
    `);
    inheritsClass(newCls, Target);
    var _super = createSuperCls(newCls);
    return extend && extendFunc && _super && newCls;
  }
}

export function autoExtendConstructor<Args extends any[], T extends new (...args: Args) => any>(
  Target: T,
  extend: (target: InstanceType<T>, args: Args) => any,
  rename?: string | ((name: string) => string)
) {
  if (extend instanceof Function) {
    const newTargeName =
      (rename && (rename instanceof Function ? rename(Target.name) : rename)) || Target.name;

    let newClsFactory = function trick() {
      // @ts-ignore
      // eslint-disable-next-line prefer-const
      class TClassAnonymous extends Target {
        constructor(...args: Args) {
          super(...(args as Args));
          extend(this as InstanceType<T>, args);
        }
      }
      return TClassAnonymous;
    };
    const trickClsName = newClsFactory().name || "_TEMP";
    eval(
      `newClsFactory = ${newClsFactory
        .toString()
        .replace("class extends", `class ${trickClsName} extends`)
        .replaceAll(trickClsName, newTargeName)}`
    );
    return newClsFactory();
  }
}
