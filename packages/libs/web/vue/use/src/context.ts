import { provide, inject } from "vue-demi";
// import type { Component } from "@type-helper/vue3";
import type { Component } from "@type-helper/vue2";

export function createContext<Target extends any>(
  name: string,
  defaultProvide?: Target | (() => Target),
  treatDefaultProvideAsFactory?: boolean
) {
  const key = Symbol(name);
  let Provider: Component<{ value: Target }>;
  return {
    provide<T>(target: T): T {
      provide(key, target);
      return target;
    },
    inject(
      defaultValue: Target | (() => Target) = defaultProvide,
      treatDefaultAsFactory: boolean = treatDefaultProvideAsFactory
    ): Target {
      return inject(key, (defaultValue as any) || null, treatDefaultAsFactory);
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
