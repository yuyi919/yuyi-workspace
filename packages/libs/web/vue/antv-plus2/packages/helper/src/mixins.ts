import Vue, { VueConstructor } from "vue";
export type VueClass<V> = {
  new (...args: any[]): V & Vue;
} & VueConstructor<V & Vue>;

export function mixins<A>(CtorA: VueClass<A>): VueClass<A>;
export function mixins<A, B>(CtorA: VueClass<A>, CtorB: VueClass<B>): VueClass<A & B>;
export function mixins<A, B, C>(
  CtorA: VueClass<A>,
  CtorB: VueClass<B>,
  CtorC: VueClass<C>
): VueClass<A & B & C>;
export function mixins<A, B, C, D>(
  CtorA: VueClass<A>,
  CtorB: VueClass<B>,
  CtorC: VueClass<C>,
  CtorD: VueClass<D>
): VueClass<A & B & C & D>;
export function mixins<A, B, C, D, E>(
  CtorA: VueClass<A>,
  CtorB: VueClass<B>,
  CtorC: VueClass<C>,
  CtorD: VueClass<D>,
  CtorE: VueClass<E>
): VueClass<A & B & C & D & E>;
export function mixins<T>(...Ctors: VueClass<Vue>[]): VueClass<T>;
export function mixins(...Ctors: VueClass<Vue>[]) {
  return Vue.extend({ mixins: Ctors });
}

export { mixins as Mixins };
export function isVueComponent(Component: any): Component is VueConstructor {
  return (
    Component &&
    (Component.render instanceof Function ||
      Component.setup instanceof Function ||
      Component.component ||
      Component.components instanceof Object ||
      Component.extends ||
      Component.mixins instanceof Array)
  );
}
