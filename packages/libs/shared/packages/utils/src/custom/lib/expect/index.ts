/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { extendToFilter } from "./filterTo";

export * from "./filterTo";
export * from "./filterTypes";
export * from "./check";
import type { TypeExpectors } from "./check";
import { options as GlobalOptions } from "./check";

declare module "./check" {
  interface TypeExpectors {
    NaN: (v: any) => v is number;
  }
}

/**
 * @alpha
 */
export type ExpectorOptions = {
  [K in keyof TypeExpectors]?: (target?: any) => boolean;
};
/**
 * @alpha
 */
export type GlobalExpector = {
  (options?: ExpectorOptions): Checker<any>;
  is: Checker<any>;
};

type BaseChecker<T> = {
  readonly not: Checker<T>;
  readonly filter: Filter<T>;
};
type Filter<T> = {
  <E extends T>(...targets: E[]): E;
};

type Checker<T> = {
  [K in keyof TypeExpectors]: TypeExpectors[K] &
    Checker<TypeExpectors[K] extends (target: any) => target is infer T ? T : any>;
} & BaseChecker<T>;

function appendPipe(o: any, name: string, func: any, enumerable = true) {
  return (
    Object.defineProperty(o, name, {
      get: func,
      enumerable,
      configurable: true,
    }),
    o
  );
}
function assignAppendPipe(o: any, target: any) {
  for (const name in target) {
    Object.defineProperty(o, name, Object.getOwnPropertyDescriptor(target, name));
  }
  return o;
}
type Env = {
  core?: Checker<any> | null;
  // flag?: any;
  not: boolean;
  filter: Function;
  type: (value: any) => value is unknown;
};
const defaultEnv: Env = {
  // flag: null,
  not: false,
  filter: null,
  type: null,
};

function checkerExpect(env: Env, handle: Function, target: any) {
  if (arguments.length === 2) return false;
  let r = handle(target);
  r = env.not ? !r : r;
  return env.filter || Object.assign(env, defaultEnv), r;
}
function configure(env: Env, name: string) {
  env[name] = true;
  if (!env.type) return createChecker(env);
  return env.type;
}

function filterRunner(env: Env, ...args: any[]) {
  const r = env.filter.apply(null, args);
  env.filter = null;
  Object.assign(env, defaultEnv);
  return r;
}

function createChecker(
  env: Env = { ...defaultEnv, core: null as Checker<any> },
  options?: ExpectorOptions
): Checker<any> {
  let result = env.core;
  if (!result) {
    result = {} as Checker<any>;
    const hooks = (
      options ? { ...GlobalOptions, ...options } : { ...GlobalOptions }
    ) as Checker<any>;
    for (const key in hooks) {
      appendPipe(result, key, () => {
        return assignAppendPipe(
          (env.type = ((target: any) => checkerExpect(env, hooks[key], target)) as Env["type"]),
          env.core
        );
      });
    }
    appendPipe(result, "not", () => configure(env, "not"));
    appendPipe(result, "filter", () => {
      if (!env.type) throw Error("[Error]: need type checker!");
      env.filter = extendToFilter(env.type);
      return filterRunner.bind(null, env);
    });
    env.core = result;
  }
  return result as any;
}

/**
 * @alpha
 */
export const expect$: GlobalExpector = Object.assign(
  (options?: ExpectorOptions) => createChecker(void 0, options),
  {
    is: createChecker(),
  }
);
