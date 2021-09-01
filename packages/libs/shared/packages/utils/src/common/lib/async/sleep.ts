import { Constant$ } from "@yuyi919/shared-constant";

const { CREATE_PROMISE, delay$$ } = Constant$;

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
    ? CREATE_PROMISE<V>(function (_, reject) {
        delay$$(reject, time, emitValue);
      })
    : CREATE_PROMISE(function (resolve) {
        delay$$(resolve, time, emitValue);
      });
}

/**
 * {@inheritDoc sleep}
 * @deprecated 该方法迟早被弃用，使用 {@link sleep | sleep()} 代替
 */
export function waitingPromise<V = void>(
  time: number,
  emitValue?: V,
  isError?: boolean
): Promise<V>;
export function waitingPromise(a, b, c) {
  return sleep(a, b, c);
}

/* istanbul ignore next */
/**
 * 等待下一帧cpu时序
 * @param emitValue - 默认不需要
 */
export function nextTick(): Promise<void> {
  return CREATE_PROMISE(function (resolve) {
    delay$$(resolve, 0);
  });
}
