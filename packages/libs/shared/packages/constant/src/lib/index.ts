import { ArrayIterator, Types } from "@yuyi919/shared-types";
import {
  ARRAY,
  CALLER,
  CREATE_NEW,
  FUNCTION,
  KEY_PROTOTYPE,
  OBJECT,
  PROMISE,
  REGEXP
} from "./atomic";

export function CREATE_PROMISE<T>(
  executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void
): Promise<T> {
  return CREATE_NEW(PROMISE, [executor]);
}
export function EMPTY_PROMISE<T = any>(value: T) {
  return PROMISE.resolve(value);
}

export function BIND<
  T extends Types.Function.Base<[any, ...any[]], any>,
  TA,
  R extends T extends (this: any, ...other: infer K) => infer Re
    ? Types.Function.Base<K, Re>
    : Function
>(Func: T, thisArgs: TA, ...args: any[]): R {
  // @ts-ignore
  return FUNCTION.bind.call(Func, thisArgs, ...args);
}

// tslint:disable-next-line: class-name
// export type STATIC_BIND<
//   T extends Function,
//   Bindex extends any[]
// > = {

// }
export function BindArg$$<T extends Function, A extends Types.Function.Arg0<T>>(
  Func: T,
  arg0: A
): Types.Function.Shift1<T, A>;
export function BindArg$$<
  T extends Function,
  A extends Types.Function.Arg0<T>,
  B extends Types.Function.Arg1<T>
>(Func: T, arg0: A, arg1: B): Types.Function.Shift2<T, A, B>;
export function BindArg$$<
  T extends Function,
  A extends Types.Function.Arg0<T>,
  B extends Types.Function.Arg1<T>,
  C extends Types.Function.Arg2<T>
>(Func: T, arg0: A, arg1: B, arg2: C): Types.Function.Shift3<T, A, B, C>;
export function BindArg$$(Func: any, ...args: any[]): any {
  // @ts-ignore
  return BIND(Func, null, ...args);
}

export function CREATE_OBJECT_IS(value: any): (value: any) => boolean {
  return BindArg$$(OBJECT.is, value);
}

export interface FunctionArgsShifter<
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

export function INSTANCE_BIND<T extends Function, P extends T["prototype"], K extends keyof P>(
  instance: T,
  key: K
): FunctionArgsShifter<T, P, K> {
  // try {
  return BIND(CALLER, instance[KEY_PROTOTYPE][key]) as any;
  // } catch (error) {
  //   console.log(instance, key);
  // }
}
export function PROTOTYPE_BIND<T extends Function, P extends T["prototype"], K extends keyof P>(
  instance: T,
  key: K
): P[K] {
  // @ts-ignore
  return BIND(instance[KEY_PROTOTYPE][key], instance[KEY_PROTOTYPE]);
}

/**
 * 原生的map循环改为函数调用
 * @param arr
 * @param callbackfn
 */
export const APPLY = (fn: any, args: any[], thisArgs?: any) =>
  fn.apply(thisArgs, args) as {
    <TArgs extends any[], TResult = any, T = any>(
      source: Function,
      args: TArgs,
      thisArgs?: T
    ): TResult;
  };
/**
 * 原生的map循环改为函数调用
 * @param arr
 * @param callbackfn
 */
export const MAP = INSTANCE_BIND(ARRAY, "map") as {
  <T extends any, R = T>(arr: T[], callbackfn: ArrayIterator<T, R>, initialValue?: any[]): R[];
};

export function DEFINED_ESMODULE(_exports: any, desc: any) {
  return Object.defineProperty(_exports, "__esModule", desc);
}
// MAP()
/**
 * 原生的Array.prototype.some改为函数调用
 * @param arr
 * @param callbackfn
 * @param thisArg
 */
export const SOME = INSTANCE_BIND(ARRAY, "some") as {
  <T extends any>(arr: T[], callbackfn: ArrayIterator<T, boolean>, thisArg?: any): boolean;
};
/**
 * 原生的for循环改为函数调用
 * @param arr
 * @param callbackfn
 */
export const FOR_EACH = INSTANCE_BIND(ARRAY, "forEach") as {
  <T extends any>(arr: T[], callbackfn: ArrayIterator<T, any>): void;
};
/**
 * 原生数组的concat改为函数调用
 * @param arr
 * @param callbackfn
 */
export const ARR_CONCAT = PROTOTYPE_BIND(ARRAY, "concat") as {
  <T extends any, A extends any = T>(arr: T[], ...next: A[][]): (A | T)[];
  <T extends any, A extends any = T>(arr: T[], ...next: A[]): (A | T)[];
};
/**
 * 原生数组的silce改为函数调用
 * @param arr
 * @param callbackfn
 */
export const ARR_SLICE = INSTANCE_BIND(ARRAY, "slice") as {
  <T extends any>(arr: T[], startIndex?: number, endIndex?: number): T[];
  // tslint:disable-next-line: unified-signatures
  <T extends any>(arr: IArguments, startIndex?: number, endIndex?: number): T[];
};

/**
 * 原生的for循环改为函数调用
 * @param arr
 * @param callbackfn
 */
export const FILTER = INSTANCE_BIND(ARRAY, "filter") as {
  <T extends any>(arr: T[], callbackfn: ArrayIterator<T, boolean>): T[];
};

/**
 * 原生的reduce改为函数调用
 * @param arr
 * @param callbackfn
 * @param initialValue
 * @example
 * REDUCE([1, 2, 3, 4], (target: any, i: number) => ({ ...target, [i]: i }), {})
 */
export const REDUCE = INSTANCE_BIND(ARRAY, "reduce") as {
  <T extends any, R = T>(
    arr: T[],
    callbackfn: (previousValue: R, currentValue: T, currentIndex: number, array: T[]) => R,
    initialValue?: R
  ): R;
};
/**
 * 原生的Array<T>.push改为函数调用
 * @param arr 目标数组
 * @param elements 新元素
 * @example
 * ARR_PUSH([1, 2, 3, 4], 5, 6, 7)
 */
export const ARR_PUSH = INSTANCE_BIND(ARRAY, "push") as {
  <T extends any, E = T>(arr: T[], ...elements: E[]): number;
};

/**
 * 原生的push改为函数调用
 * @param arr 目标数组
 * @param elements 新元素
 * @example
 * REGEXP_TEST(/123/, '123') // => true
 */
export const REGEXP_TEST = INSTANCE_BIND(REGEXP, "test") as {
  (reg: RegExp, str: string): boolean;
};

export const delay$$: <P extends any[]>(
  handle: (...args: P) => void,
  sec: number,
  ...args: P
) => number = BIND(setTimeout, null) as any;

/**
 *
 * @param arr
 * @param callbackfn
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

function FOR_EACH_P$$<T>(
  arr: T[],
  callbackfn: ArrayIterator<T, any>,
  tmp: { i: number },
  length: number
) {
  callbackfn(arr[tmp.i], tmp.i, arr);
  // console.trace('test')
  // @ts-ignore
  return tmp.i++ < length ? FOR_EACH_P$$(arr, callbackfn, tmp, length) : true;
}
/**
 *
 * @param arr
 * @param callbackfn
 */
export function FOR_EACH$$<T>(arr: T[], callbackfn: ArrayIterator<T, any>): true {
  const tmp = { i: 0 };
  const length = arr.length - 1;
  try {
    return FOR_EACH_P$$(arr, callbackfn, tmp, length);
  } catch (error) {
    while (length - tmp.i++) callbackfn(arr[tmp.i], tmp.i, arr);
    return true;
  }
}

//
export const Key_useDeprecatedSynchronousErrorHandling$$ = "useDeprecatedSynchronousErrorHandling";

export * from "./atomic";
