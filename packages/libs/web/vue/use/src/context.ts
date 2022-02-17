/* eslint-disable @typescript-eslint/no-explicit-any */
import { provide, inject } from "vue-demi";
// import type { Component } from "@type-helper/vue3";
import type { Component } from "@type-helper/vue2";

export type ContextFactoryManager<T> = {
  provide<PT extends T>(target: PT): PT;
  inject(): T;
  inject(defaultValue: T | null): T;
  inject(defaultValue: (() => T | null) | null, treatDefaultAsFactory: true): T;
  inject(defaultValue: T | null | null, treatDefaultAsFactory?: false): T;
  readonly Provider: Component<{ value: T }>;
};
// const a = createContext("a", () => 1 as number).inject(() => 2);
// const a2 = createContext("a2", () => 1, true).inject(() => 2, true);
// const b = createContext("b", 1).inject(1);
// const b2 = createContext("b", 1).inject(() => 1, true);

export function createContext<Target>(
  name: string,
  defaultProvide?: Target,
  treatDefaultProvideAsFactory?: false
): ContextFactoryManager<Target>;
export function createContext<Target extends () => any>(
  name: string,
  defaultProvide: Target,
  treatDefaultProvideAsFactory: true
): ContextFactoryManager<ReturnType<Target>>;
export function createContext<Target extends any>(
  name: string,
  defaultProvide?: any,
  treatDefaultProvideAsFactory?: boolean
) {
  const key = Symbol(name);
  let Provider: Component<{ value: Target }>;
  return {
    provide(target: any) {
      provide(key, treatDefaultProvideAsFactory ? target() : target);
      return target;
    },
    inject(
      defaultValue: Target | (() => Target) = defaultProvide,
      treatDefaultAsFactory?: boolean
    ): Target {
      return inject(key, (defaultValue as any) || null, treatDefaultAsFactory as true);
    },
    get Provider() {
      if (!Provider) {
        Provider = {
          props: { value: null },
          setup(props) {
            provide(key, props.value);
            return {};
          },
          render() {
            return this.$slots.default;
          },
        } as unknown as Component<{ value: Target }>;
      }
      return Provider;
    },
  };
}
