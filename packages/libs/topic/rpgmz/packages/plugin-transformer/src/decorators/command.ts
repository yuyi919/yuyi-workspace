import * as RMMZ from "@yuyi919/rpgmz-core";
import { createDeepMap } from "./createDeepMap";
import env, { Global } from "./helper";
import { Struct } from "./structs";
import { ConstructorType, defineCommandMeta, getCommandMeta } from "./metaData";
import { RMMZPluginParamType } from "./Type";
import { logger, plainToClass } from "./utils";

const internalKey = {
  Interpreter: Symbol("RMMZ.Game_Interpreter"),
};
export type ArgsTransformer = ReturnType<typeof createArgTransformer>;

export const MethodInjectedMap = createDeepMap<ArgMeta[]>();

export function Command(): MethodDecorator {
  return (target, key: string) => {
    const args = MethodInjectedMap.get(target, key, () => []);
    defineCommandMeta(target, key, createArgTransformer(args));
    env.registerCommand(key, (args: any, Interpreter: RMMZ.Game_Interpreter) => {
      const handle = env.getParameters(target.constructor as ConstructorType);
      logger.log(`Call Command "${key}"`);
      return callCommandWith(
        handle,
        key,
        Object.assign(args, {
          [internalKey.Interpreter]: Interpreter,
        })
      );
    });
  };
}

export function callCommandWith<T extends Record<string, any>>(
  thisArg: T,
  commandName: keyof T,
  {
    [internalKey.Interpreter]: Interpreter = (globalThis as Global).$gameTroop._interpreter,
    ...argsDto
  }: any = {}
) {
  const transformer: ArgsTransformer = getCommandMeta(thisArg as any, commandName as string);
  if (!transformer) throw Error("This method isn't a Command!");
  const callCommandWith = transformer.transform(argsDto, Interpreter);
  logger.log(`Command "${commandName}" transform: `, argsDto, "=>", callCommandWith);
  return (thisArg[commandName] as unknown as Function).apply(thisArg, callCommandWith);
}
Command.callWith = callCommandWith;

export const Args = () => (Target: any) => {
  return Struct()(Target);
};
export type ArgMeta = { name: string | symbol; type?: any; dto?: boolean };

function createArgTransformer(args: ArgMeta[]) {
  // eslint-disable-next-line prefer-const
  let Cls: ConstructorType = args.find((o) => o.dto && o.type instanceof Function)?.type();
  return {
    transform(argsDto: any, handle: RMMZ.Game_Interpreter) {
      const cls = Cls ? plainToClass(Cls, argsDto) : argsDto;
      return args.map(({ name, type }) => {
        if (!name && cls instanceof type()) {
          return cls;
        } else if (name === internalKey.Interpreter) {
          return handle;
        } else if (name) {
          return cls[name];
        }
      });
    },
  };
}

/**
 * 参数注入为class
 */
export function ArgDto<T>(type: () => new (...args: any[]) => T): ParameterDecorator {
  return (target, methodName: string, index) => {
    const initial = MethodInjectedMap.get(target, methodName, () => []);
    const meta: ArgMeta = { name: null, type: type as unknown as () => any, dto: true };
    initial[index] = meta;
  };
}
/**
 * 根据名称注入参数
 */
export function Arg(name: string, type?: RMMZPluginParamType): ParameterDecorator {
  return (target, methodName: string, index) => {
    const initial = MethodInjectedMap.get(target, methodName, () => []);
    const meta: ArgMeta = {
      name,
      type: Reflect.getMetadata("design:paramtypes", target, methodName)[index],
    };
    initial[index] = meta;
  };
}
/**
 * 給參數注入 `RMMZ.Game_Interpreter`
 */
export function Interpreter(): ParameterDecorator {
  return (target, methodName: string, index) => {
    const initial = MethodInjectedMap.get(target, methodName, () => []);
    const meta: ArgMeta = { name: internalKey.Interpreter };
    initial[index] = meta;
  };
}
