import { CREATE_NEW, PROMISE } from "@yuyi919/shared-constant";

/**
 * 类型统一的setTimeout
 * @param handle -
 * @param sec -
 * @param args -
 * @beta
 */
export const delay: <P extends any[]>(
  handle: (...args: P) => void,
  sec: number,
  ...args: P
) => number = setTimeout as any;

/**
 * `new Promise(...)`的函数版
 * @param executor - 参照new Promise
 * @returns 返回一个Promise
 * @public
 */
export function createPromise<T, E = any>(
  executor: (resolve: (value?: T) => any, reject: (reason?: E) => any) => any
): Promise<T> {
  return new PROMISE(executor) as Promise<T>;
}

/**
 * 返回只有一个then函数（参照Promise来理解）的对象
 * @param executor - 参照new Promise
 * @returns 返回一个PromiseLike
 * @public
 */
export function createPromiseLike<T, E = any>(
  executor: (resolve: (v: T) => any, reject: (e: E) => any) => any
): PromiseLike<T> {
  return {
    then(onf, onr) {
      return executor(onf!, onr!);
    }
  };
}

/**
 * 为提供的值创建一个新的已完成Promise
 * @param value -
 * @returns 一个内部状态与提供的 值/PromiseLike 匹配的 Promise
 * @beta
 */
export function toPromise<T = any>(value: T | PromiseLike<T>) {
  return PROMISE.resolve(value);
}

/**
 * 异步等候
 * @param time - 等候时间
 * @param emitValue - 默认不需要
 * @param isError - 是否以reject
 * @typeParam V - Promise.resolve的值类型
 * @returns 返回Promise<V>
 * @public
 */
export function sleep<V = void>(time: number, emitValue?: V, isError = false): Promise<V> {
  return isError
    ? createPromise<V>((_, reject) => {
        delay(reject, time, emitValue);
      })
    : createPromise((resolve) => {
        delay(resolve, time, emitValue);
      });
}

/**
 * {@inheritDoc sleep}
 * @deprecated 该方法迟早被弃用，使用 {@link sleep | sleep()} 代替
 * @internal
 */
export function waitingPromise<V = void>(
  time: number,
  emitValue?: V,
  isError?: boolean
): Promise<V>;
export function waitingPromise() {
  return sleep.call(null, arguments as any);
}

/* istanbul ignore next */
/**
 * 等待下一帧cpu时序
 * @param emitValue - 默认不需要
 * @beta
 */
export function nextTick(): Promise<void> {
  return createPromise((resolve) => {
    delay(resolve, 0);
  });
}
