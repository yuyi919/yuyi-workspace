import { computed, ComputedRef, shallowReactive } from "vue-demi";
import { matchMediaQuery, MediaQuery, useMediaQueryWith } from "./useMediaQuery";
import { ConfigurableWindow } from "./_configurable";
import { increaseWithUnit } from "./_util";

export type BreakpointsConfig<K extends string = string> = Record<K, number | string>;

export class Breakpoints<K extends string> {
  constructor(private breakpoints: BreakpointsConfig<K>, public options?: ConfigurableWindow) {}

  private getValue(k: K, delta?: number) {
    let v = this.breakpoints[k];
    if (delta != null) v = increaseWithUnit(v, delta);
    if (typeof v === "number") v = `${v}px`;
    return v;
  }

  greater = (k: K) => {
    return new MediaQuery(`(min-width: ${this.getValue(k)})`, this.options);
  };
  smaller = (k: K) => {
    return new MediaQuery(`(max-width: ${this.getValue(k, -0.1)})`, this.options);
  };
  between = (a: K, b: K) => {
    return new MediaQuery(
      `(min-width: ${this.getValue(a)}) and (max-width: ${this.getValue(b, -0.1)})`
    );
  };

  isGreater = (k: K) => {
    return matchMediaQuery(`(min-width: ${this.getValue(k)})`);
  };

  isSmaller = (k: K) => {
    return matchMediaQuery(`(max-width: ${this.getValue(k, -0.1)})`);
  };

  isInBetween = (a: K, b: K) => {
    return matchMediaQuery(
      `(min-width: ${this.getValue(a)}) and (max-width: ${this.getValue(b, -0.1)})`
    );
  };
}

type StoreResolver<Store> = {
  [K in keyof Store]?:
    | true
    | (Store[K] extends (...args: infer Args) => infer R
        ? (value: R, args: Args) => any
        : (value: Store[K]) => any);
};

export type ExportComputed<Store, Resolver extends StoreResolver<Store>> = {
  [K in keyof Resolver]: K extends keyof Store
    ? // 如果key在源对象中是函数
      Store[K] extends (...args: infer SourceArgs) => infer SourceResult
      ? // 如果Resolver是函数
        Resolver[K] extends (args: SourceResult) => infer ResolvedValue
        ? // 返回一个继承函数，通过Resolver将SourceResult转换成ResolvedValue
          (...args: SourceArgs) => ResolvedValue
        : // 否则如果Resolver是true
        Resolver[K] extends true
        ? // 返回源函数
          Store[K]
        : // 否则返回never
          never
      : // 否则，如果Resolver是函数
      Resolver[K] extends (args: Store[K]) => infer Resolved
      ? // 返回经过Resolver计算后的ComputedRef
        ComputedRef<Resolved>
      : // 否则如果Resolver是true
      Resolver[K] extends true
      ? // 返回源对象中key的ComputedRef
        ComputedRef<Store[K]>
      : // 否则返回never
        never
    : never;
};

export function exportReactiveFromWrapper<Store, Resolver extends StoreResolver<Store>>(
  store: Store,
  resolver: Resolver
): ExportComputed<Store, Resolver> {
  const result = {} as Record<string, any>;
  for (const key in resolver) {
    if (key in store) {
      const source = store[key as unknown as keyof Store];
      const resolveHandle: Resolver[keyof Resolver] = resolver[key];
      if (typeof source === "function") {
        if (resolveHandle === true) {
          result[key] = source;
        } else {
          result[key] = (...args: any[]) => {
            return (resolveHandle as (value: any, args: any[]) => any)(source(...args), args);
          };
        }
      } else if (typeof resolveHandle === "function") {
        result[key] = computed(() => {
          return (resolveHandle as (value: any) => any)(store[key as any]);
        });
      } else {
        result[key] = computed(() => store[key as any]);
      }
    }
  }
  return result as ExportComputed<Store, Resolver>;
}

/**
 * Reactively viewport breakpoints
 *
 * @see https://vueuse.org/useBreakpoints
 * @param options
 */
export function useBreakpoints<K extends string>(
  breakpoints: BreakpointsConfig<K>,
  options?: ConfigurableWindow
) {
  const store = shallowReactive(new Breakpoints<K>(breakpoints, options));
  return exportReactiveFromWrapper(store, {
    greater: useMediaQueryWith,
    smaller: useMediaQueryWith,
    between: useMediaQueryWith,
    isGreater: true,
    isSmaller: true,
    isInBetween: true,
    options: true,
  });
}
export type UseBreakpointsReturn = ReturnType<typeof useBreakpoints>;
