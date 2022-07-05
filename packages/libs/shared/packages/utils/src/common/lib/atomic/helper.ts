import { ARRAY, CALLER, FUNCTION, KEY_PROTOTYPE, OBJECT, REGEXP } from "@yuyi919/shared-constant";
import { ArrayIterator, Types } from "@yuyi919/shared-types";

/**
 *
 * @param Func -
 * @param thisArgs -
 * @param args -
 * @alpha
 */
export function bind<
  T extends Types.Function.Base<[any, ...any[]], any>,
  TA,
  R extends T extends (this: any, ...other: infer K) => infer Re
    ? Types.Function.Base<K, Re>
    : Function
>(Func: T, thisArgs: TA, ...args: any[]): R {
  // @ts-ignore
  return FUNCTION.bind.call(Func, thisArgs, ...args);
}

/**
 *
 * @param Func -
 * @param args -
 * @beta
 */
export function bindArgList<T extends Function, A extends Types.Function.Arg0<T>>(
  Func: T,
  arg0: [A]
): Types.Function.Shift1<T, A>;

/**
 * {@inheritDoc (bindArgList:1)}
 * @beta
 */
export function bindArgList<
  T extends Function,
  A extends Types.Function.Arg0<T>,
  B extends Types.Function.Arg1<T>
>(Func: T, args: [A, B]): Types.Function.Shift2<T, A, B>;
/**
 *
 * {@inheritDoc (bindArgList:1)}
 * @beta
 */
export function bindArgList<
  T extends Function,
  A extends Types.Function.Arg0<T>,
  B extends Types.Function.Arg1<T>,
  C extends Types.Function.Arg2<T>
>(Func: T, args: [A, B, C]): Types.Function.Shift3<T, A, B, C>;
/**
 *
 * {@inheritDoc (bindArgList:1)}
 * @beta
 */
export function bindArgList<
  T extends Function,
  A extends Types.Function.Arg0<T>,
  B extends Types.Function.Arg1<T>,
  C extends Types.Function.Arg2<T>,
  D extends Types.Function.Arg3<T>
>(Func: T, args: [A, B, C, D]): Types.Function.Shift4<T, A, B, C, D>;
/**
 * {@inheritDoc (bindArgList:1)}
 * @beta
 */
export function bindArgList<
  T extends Function,
  A extends Types.Function.Arg0<T>,
  B extends Types.Function.Arg1<T>,
  C extends Types.Function.Arg2<T>,
  D extends Types.Function.Arg3<T>,
  O
>(Func: T, args: [A, B, C, D], ...others: O[]): (...args: O[]) => Types.Function.ReturnType<T>;
/**
 * {@inheritDoc (bindArgList:1)}
 * @beta
 */
export function bindArgList<T extends Types.Fn>(
  Func: T,
  args: any[],
  ...others: any[]
): (...args: any[]) => Types.Function.ReturnType<T>;
export function bindArgList(func: any, args: any[], handler?: any) {
  return FUNCTION.bind.apply(func, ARR_CONCAT([handler], args) as [any, ...any[]]);
}

// tslint:disable-next-line: class-name
// export type STATIC_BIND<
//   T extends Function,
//   Bindex extends any[]
// > = {

// }
/**
 *
 * @param Func -
 * @param arg0 -
 * @param arg1 -
 * @param arg2 -
 * @param arg3 -
 * @param args - 
 * @beta
 */
export function bindArgs<T extends Function, A extends Types.Function.Arg0<T>>(
  Func: T,
  arg0: A
): Types.Function.Shift1<T, A>;

/**
 * {@inheritDoc (bindArgs:1)}
 * @beta
 */
export function bindArgs<
  T extends Function,
  A extends Types.Function.Arg0<T>,
  B extends Types.Function.Arg1<T>
>(Func: T, arg0: A, arg1: B): Types.Function.Shift2<T, A, B>;
/**
 * {@inheritDoc (bindArgs:1)}
 * @beta
 */
export function bindArgs<
  T extends Function,
  A extends Types.Function.Arg0<T>,
  B extends Types.Function.Arg1<T>,
  C extends Types.Function.Arg2<T>
>(Func: T, arg0: A, arg1: B, arg2: C): Types.Function.Shift3<T, A, B, C>;
/**
 * {@inheritDoc (bindArgs:1)}
 * @beta
 */
export function bindArgs<
  T extends Function,
  A extends Types.Function.Arg0<T>,
  B extends Types.Function.Arg1<T>,
  C extends Types.Function.Arg2<T>,
  D extends Types.Function.Arg3<T>
>(Func: T, arg0: A, arg1: B, arg2: C, arg3: D): Types.Function.Shift4<T, A, B, C, D>;
/**
 * {@inheritDoc (bindArgs:1)}
 * @beta
 */
export function bindArgs<
  T extends Function,
  A extends Types.Function.Arg0<T>,
  B extends Types.Function.Arg1<T>,
  C extends Types.Function.Arg2<T>,
  D extends Types.Function.Arg3<T>
>(
  Func: T,
  arg0: A,
  arg1: B,
  arg2: C,
  arg3: D,
  ...args: any[]
): (...args: any[]) => Types.Function.ReturnType<T>;
export function bindArgs(Func: any, ...args: any[]): any {
  // @ts-ignore
  return bind(Func, null, ...args);
}

/**
 *
 * @param value -
 * @alpha
 */
export function createObjectIs(value: any): (value: any) => boolean {
  return bindArgs(OBJECT.is, value);
}

/**
 * @alpha
 */
export interface InstanceArgsShifter<
  T extends Function,
  P extends T["prototype"],
  K extends keyof P
> {
  <Args extends P[K] extends (arg: infer A) => any ? A : any>(source: P, arg: Args): P[K] extends (
    ...args: any[]
  ) => infer R
    ? R
    : any;
}

/**
 *
 * @param constructor -
 * @param key -
 * @alpha
 */
export function INSTANCE_BIND<T extends Function, P extends T["prototype"], K extends keyof P>(
  constructor: T,
  key: K
): InstanceArgsShifter<T, P, K> {
  // try {
  return bind(CALLER, constructor[KEY_PROTOTYPE][key]) as any;
  // } catch (error) {
  //   console.log(instance, key);
  // }
}

/**
 *
 * @param constructor -
 * @param key -
 * @alpha
 */
export function PROTOTYPE_BIND<T extends Function, P extends T["prototype"], K extends keyof P>(
  constructor: T,
  key: K
): P[K] {
  // @ts-ignore
  return bind(constructor[KEY_PROTOTYPE][key], constructor[KEY_PROTOTYPE]);
}

/**
 *
 * @param constructor - 构造函数
 * @param key - 实例函数名称
 * @param args - 函数参数
 * @alpha
 */
export function PROTOTYPE_APPLY<T extends Function, P extends T["prototype"], K extends keyof P>(
  constructor: T,
  key: K,
  args: Parameters<P[K]> | IArguments
) {
  const proto = constructor[KEY_PROTOTYPE];
  return APPLY(proto[key], args as any[], proto);
}

/**
 * @param fn -
 * @param args -
 * @param thisArgs -
 * @beta
 */
export function APPLY<T extends Types.Fn>(
  fn: T,
  args: IArguments | Parameters<T>,
  thisArgs?: ThisParameterType<T>
): ReturnType<T>;
export function APPLY(fn: any, args: any, thisArgs?: any) {
  return fn.apply(thisArgs, args);
}

/**
 * 原生的map循环改为函数调用
 * @param arr -
 * @param callbackfn -
 * @alpha
 */
export const MAP = /* @__PURE__ */ INSTANCE_BIND(ARRAY, "map") as {
  <T extends any, R = T>(arr: T[], callbackfn: ArrayIterator<T, R>, initialValue?: any[]): R[];
};

// MAP()
/**
 * 原生的Array.prototype.some改为函数调用
 * @param arr -
 * @param callbackfn -
 * @param thisArg -
 * @alpha
 */
export const SOME = /* @__PURE__ */ INSTANCE_BIND(ARRAY, "some") as {
  <T extends any>(arr: T[], callbackfn: ArrayIterator<T, boolean>, thisArg?: any): boolean;
};

/**
 * 原生的for循环改为函数调用
 * @param arr -
 * @param callbackfn -
 * @alpha
 */
export const FOR_EACH = /* @__PURE__ */ INSTANCE_BIND(ARRAY, "forEach") as {
  <T extends any>(arr: T[], callbackfn: ArrayIterator<T, any>): void;
};

/**
 * 原生数组的concat改为函数调用
 * @param arr -
 * @param next -
 * @beta
 */
export function ARR_CONCAT<T extends any, A extends any = T>(arr: T[], ...next: A[][]): (A | T)[];
/**
 * {@inheritDoc (ARR_CONCAT:1)}
 * @beta
 */
export function ARR_CONCAT<T extends any, A extends any = T>(
  arr: T | T[],
  ...next: (A | A[])[]
): (A | T)[];
export function ARR_CONCAT() {
  return PROTOTYPE_APPLY(ARRAY, "concat", arguments);
}

/**
 * 原生数组的silce改为函数调用
 * @param arr -
 * @param callbackfn -
 * @alpha
 */
export const ARR_SLICE = /* @__PURE__ */ INSTANCE_BIND(ARRAY, "slice") as {
  <T extends any>(arr: T[], startIndex?: number, endIndex?: number): T[];
  // tslint:disable-next-line: unified-signatures
  <T extends any>(arr: IArguments, startIndex?: number, endIndex?: number): T[];
};

/**
 * 原生的for循环改为函数调用
 * @param arr -
 * @param callbackfn -
 * @alpha
 */
export const FILTER = /* @__PURE__ */ INSTANCE_BIND(ARRAY, "filter") as {
  <T extends any>(arr: T[], callbackfn: ArrayIterator<T, boolean>): T[];
};

/**
 * 原生的reduce改为函数调用
 * @param arr -
 * @param callbackfn -
 * @param initialValue -
 * @example
 * ```ts
 * REDUCE([1, 2, 3, 4], (target: any, i: number) => ({ ...target, [i]: i }), {})
 * ```
 * @alpha
 */
export const REDUCE = /* @__PURE__ */ INSTANCE_BIND(ARRAY, "reduce") as {
  <T extends any, R = T>(
    arr: T[],
    callbackfn: (previousValue: R, currentValue: T, currentIndex: number, array: T[]) => R,
    initialValue?: R
  ): R;
};
/**
 * 原生的Array<T>.push改为函数调用
 * @param arr - 目标数组
 * @param elements - 新元素
 * @example
 * ```ts
 * ARR_PUSH([1, 2, 3, 4], 5, 6, 7)
 * ```
 * @alpha
 */
export const ARR_PUSH = /* @__PURE__ */ INSTANCE_BIND(ARRAY, "push") as {
  <T extends any, E = T>(arr: T[], ...elements: E[]): number;
};

/**
 * 原生的push改为函数调用
 * @param arr - 目标数组
 * @param elements - 新元素
 * @example
 * ```ts
 * REGEXP_TEST(/123/, '123') // => true
 * ```
 * @alpha
 */
export const REGEXP_TEST = /* @__PURE__ */ INSTANCE_BIND(REGEXP, "test") as {
  (reg: RegExp, str: string): boolean;
};

/**
 *
 * @param arr -
 * @param callbackfn -
 * @alpha
 */
export function MAP$$<T, R>(arr: T[], callbackfn: ArrayIterator<T, R>): R[];
export function MAP$$<T, R>(
  arr: T[],
  callbackfn: ArrayIterator<T, R>,
  initialValue: R[] = [],
  i = 0,
  length = arr.length - 1
) {
  initialValue[i] = callbackfn(arr[i], i, arr);
  return i < length
    ? // @ts-ignore
      MAP$$(arr, callbackfn, initialValue, i + 1, length)
    : initialValue;
}

function forEachP<T>(
  arr: T[],
  callbackfn: ArrayIterator<T, any>,
  tmp: { i: number },
  length: number
) {
  callbackfn(arr[tmp.i], tmp.i, arr);
  // console.trace('test')
  // @ts-ignore
  return tmp.i++ < length ? forEachP(arr, callbackfn, tmp, length) : true;
}
/**
 *
 * @param arr -
 * @param callbackfn -
 * @alpha
 */
export function FOR_EACH$$<T>(arr: T[], callbackfn: ArrayIterator<T, any>): true {
  const tmp = { i: 0 };
  const length = arr.length - 1;
  try {
    return forEachP(arr, callbackfn, tmp, length);
  } catch (error) {
    while (length - tmp.i++) callbackfn(arr[tmp.i], tmp.i, arr);
    return true;
  }
}
