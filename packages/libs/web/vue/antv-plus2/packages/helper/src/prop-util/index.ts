import { getCurrentInstance, onUnmounted, reactive, SetupContext } from "vue-demi";
import { Types } from "@yuyi919/shared-types";
import type { TypedPropsGroup } from "@yuyi919/vue-shared-decorators";
import { UNSAFE_STORE_PROPS_KEY } from "@yuyi919/vue-shared-decorators";
import { cloneDeep, omit } from "lodash";
import Vue from "vue";
import { getFromVueComponent } from "../optionResolver";

export * from "@yuyi919/vue-shared-decorators";
export type {
  ITypedPropOptions,
  TypedPropsGroup,
  WalkHandler
} from "@yuyi919/vue-shared-decorators";

export interface IVModelDefine<K extends string = string> {
  prop?: K;
  event?: string;
}
export function getPropsClass<
  T extends TPropProvider<Vue>,
  Props extends VCProps<InstanceType<T>, false>
>(
  component: T,
  replaceInitProps?: Partial<VCProps<InstanceType<T>, false>>
): (new () => Props) & {
  model: IVModelDefine<Types.KeyOf<Props>>;
  props: TypedPropsGroup<Props>;
};
export function getPropsClass<
  T extends TPropProvider<Vue>,
  Props extends VCProps<InstanceType<T>, false>,
  PropKey extends Types.KeyOf<Props>,
  Resolver = Partial<Omit<InstanceType<T>, PropKey | VueInstanceKeys>>
>(
  component: T,
  replaceInitProps?: VCProps<InstanceType<T>, false>,
  ...igronProps: PropKey[]
): (new () => Resolver) & {
  model: IVModelDefine<Exclude<Types.KeyOf<Props>, PropKey>>;
  props: TypedPropsGroup<Resolver>;
  // [UNSAFE_STORE_PROPS_KEY]: TypedPropsGroup<Resolver>;
};
export function getPropsClass<Props extends Types.Recordable, PropKey extends Types.KeyOf<Props>>(
  component: any,
  replaceInitProps?: Partial<Props>,
  ...igronProps: PropKey[]
): (new () => Props) & {
  model: IVModelDefine<PropKey>;
  props: TypedPropsGroup<Props>;
  // [UNSAFE_STORE_PROPS_KEY]: TypedPropsGroup<Props>;
};
export function getPropsClass<T extends Types.Recordable = any>(
  component: any,
  replaceInitProps?: Partial<T>,
  ...igronProps: (keyof T)[]
): (new () => T) & { model: any; props: TypedPropsGroup<T> } {
  const props = cloneDeep(getFromVueComponent(component, "props"));
  const nextProps = _getPropsClass1(
    (igronProps.length > 0 && omit(props, igronProps)) || props,
    replaceInitProps
  );
  function Props() {}
  Props.prototype = {};
  return Object.assign(Props, {
    props: nextProps,
    model: getFromVueComponent(component, "model"),
    [UNSAFE_STORE_PROPS_KEY]: nextProps
  }) as any;
}

function _getPropsClass1<T extends Record<string, any>>(props: T, replaceInitProps?: any): T {
  if (props && replaceInitProps) {
    for (const key of Object.keys(replaceInitProps)) {
      const propsOptions = props[key];
      if (propsOptions) {
        const isObject = replaceInitProps[key] instanceof Object;
        props[key as keyof T] = {
          ...propsOptions,
          default: isObject ? () => replaceInitProps[key] : replaceInitProps[key]
        };
        // (propsOptions.def && propsOptions.def(replaceInitProps[key])) || (propsOptions.default = replaceInitProps[key])
      }
    }
  }
  return props;
}

type Required<T, K extends keyof T> = {
  [Key in Exclude<keyof T, K extends false | undefined ? never : K>]+?: T[Key];
} & {
  [Key in keyof Pick<T, K extends false | undefined ? never : K>]-?: T[Key];
};

export type AutoRequired<T, K extends keyof T | false | undefined = undefined> = K extends undefined
  ? T
  : K extends keyof T
  ? Types.Type<Required<T, K>>
  : K extends false
  ? Partial<T>
  : T;

/**
 * Vue组件内部使用的固定的属性名称
 */
export type VueInstanceKeys = keyof Vue | "_tsx" | "style";
/**
 * 工具类型
 * 排除掉Vue组件内部使用的固定的属性名称，输出剩下的类型
 */
export type ExcludeVueTypes<T> = Omit<T, VueInstanceKeys>;
/**
 * 截取Prop用类型
 * 第二个Type传入需要为required的Key,不传为保留原类型,传递false时全部指定不为required
 */
export type VCProps<
  T,
  RequiredKey extends keyof ExcludeVueTypes<T> | false | undefined = undefined
> = AutoRequired<ExcludeVueTypes<T>, RequiredKey>;

export abstract class HookFactory<Props = Types.Recordable> {
  $instance = getCurrentInstance()!.proxy as Vue & Props;
  constructor(protected context: SetupContext, public props: Props = {} as Props) {}
  protected $emit(eventName: string, args?: any, ...other: any[]) {
    return this.context.emit(eventName, args, ...other);
  }
  get $slots() {
    return this.$instance.$slots;
  }
  get $scopedSlots() {
    return this.$instance.$scopedSlots;
  }
  get $refs() {
    return this.$instance.$refs;
  }
  $once(event: string | string[], callback: Types.Function.Base) {
    return this.$instance.$once(event, callback);
  }
  $on(event: string | string[], callback: Types.Function.Base) {
    return this.$instance.$on(event, callback);
  }
  public $install?(props: Props): void | (() => void);
}

export function useHookFactory<Props, F extends HookFactory<Props>, Args extends any[]>(
  factory: Types.ConstructorType<F, [context: SetupContext, props: Props, ...args: Args]>,
  context: SetupContext,
  props: Props,
  ...args: Args
): F {
  const store = reactive(new factory(context, props, ...args)) as F;
  const disposer = store.$install?.(props);
  if (disposer && disposer instanceof Function) {
    onUnmounted(disposer);
  }
  return store;
}

export abstract class PropProvider<T> {
  public static [UNSAFE_STORE_PROPS_KEY]: TypedPropsGroup<any>;
}
export type TPropProvider<T> = new () => T;

export function PropsMixins<A>(ctorA: TPropProvider<A>): TPropProvider<A>;
export function PropsMixins<A, B>(
  ctorA: TPropProvider<A>,
  ctorB: TPropProvider<B>
): TPropProvider<A & B>;
export function PropsMixins<A, B, C>(
  ctorA: TPropProvider<A>,
  ctorB: TPropProvider<B>,
  ctorC: TPropProvider<C>
): TPropProvider<A & B & C>;
export function PropsMixins<A, B, C, D>(
  ctorA: TPropProvider<A>,
  ctorB: TPropProvider<B>,
  ctorC: TPropProvider<C>,
  ctorD: TPropProvider<D>
): TPropProvider<A & B & C & D>;
export function PropsMixins<A, B, C, D, E>(
  ctorA: TPropProvider<A>,
  ctorB: TPropProvider<B>,
  ctorC: TPropProvider<C>,
  ctorD: TPropProvider<D>,
  ctorE: TPropProvider<E>
): TPropProvider<A & B & C & D & E>;
export function PropsMixins<T>(...ctors: TPropProvider<any>[]): TPropProvider<T>;
export function PropsMixins(...ctors: TPropProvider<any>[]) {
  //@ts-ignore
  return Vue.extend({ mixins: ctors }) as TPropProvider<T>;
}
