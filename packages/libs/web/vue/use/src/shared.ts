import { WrapValue } from "@yuyi919/shared-types";
import { computed, ComputedRef } from "vue-demi";

export type { WrapValue };

/**
 * 取得传入的以及带默认值（非undefined）的props集合
 * @param $props
 */
 export function getProps<V extends Record<string, any> = any>($props: V): V {
  const r: any = {};
  for (const [key, v] of Object.entries($props)) {
    if (v !== undefined) {
      r[key] = v;
    }
  }
  return r as V;
}

/**
 *
 * @param wrapper
 */
export function unwrap<T, GetterArgs extends any[]>(
  wrapper?: WrapValue<T, GetterArgs>,
  args: GetterArgs = [] as GetterArgs
): T {
  return (
    wrapper instanceof Function
      ? wrapper(...args)
      : wrapper instanceof Object && ('value' in wrapper) // && (wrapper as { value?: T }).value !== void 0
      ? (wrapper as { value?: T }).value
      : wrapper
  ) as T;
}

export function isWrap<T>(wrapper: WrapValue<T>): wrapper is WrapValue<T> extends T ? () => T : WrapValue<T> {
  return wrapper instanceof Function || (wrapper instanceof Object && "value" in wrapper);
}

export function useWrap<T>(wrapper: WrapValue<T>): ComputedRef<T> {
  return wrapper instanceof Function
    ? (computed(wrapper) as ComputedRef<T>)
    : wrapper instanceof Object && "value" in wrapper
    ? (wrapper as ComputedRef<T>)
    : (computed(() => wrapper) as ComputedRef<T>);
}


type UnwrapPromise<T extends any> = T extends Promise<infer R> ? R : T;
type UnwrapPromises<T extends any> = {
  [K in keyof T]: UnwrapPromise<T[K]>; // extends Promise<infer R> ? R : T[K];
};

/**
 *
 * @param target
 * @param when
 * @example
 *
 * strictThen(
 *   [Promise.resolve(0), 0, 1, "4", 123],
 *   ([a, b, c, d, e]) => a.toString() + b + c + d + e
 * );
 * // => Promise<"true014123">
 *
 * strictThen(
 *   [0, 0, 1, "4", 123],
 *   ([a, b, c, d, e]) => a.toString() + b + c + d + e
 * );
 * // => "true014123"
 */
export function strictThen<T extends [any, ...any[]], R>(
  target: T,
  when: (target: UnwrapPromises<T>) => R
): UnwrapPromises<T> extends T ? R : Promise<R>;
/**
 *
 * @param target
 * @param when
 * @example
 * strictThen(2, t => t * 2)
 * // => 4
 * strictThen(Promise.resolve(123), t => t * 2)
 * // => Promise<4>
 */
export function strictThen<T extends Promise<any>, R>(
  target: T,
  when: (target: UnwrapPromise<T>) => R
): UnwrapPromise<T> extends T ? R : Promise<R>;
export function strictThen<T, R>(target: T | Promise<T>, when: (target: T) => R): R;
export function strictThen<T, R>(target: any, when: (target: T) => R) {
  if (target instanceof Array) {
    for (const o of target) {
      if (o instanceof Promise) {
        return strictThen(Promise.all(target) as Promise<any>, when);
      }
    }
  }
  if (target instanceof Promise) {
    return target.then(when);
  }
  return when(target);
}
// strictThen(2, (t) => t * 2);
