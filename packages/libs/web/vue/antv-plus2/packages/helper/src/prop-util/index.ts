import {
  getCurrentInstance,
  onUnmounted,
  PropType,
  reactive,
  SetupContext,
} from "@vue/composition-api";
import { Types } from "@yuyi919/shared-types";
import { cloneDeep, omit } from "lodash";
import Vue, { ComponentOptions } from "vue";
import { getFromVueComponent } from "../optionResolver";

export type VModelDefine<K extends string = string> = {
  prop?: K;
  event?: string;
};
export interface TypedPropOptions<T, Required extends boolean> {
  type?: PropType<T> | null;
  required?: Required | null;
  default?: T | (() => T) | null;
  validator?: any;
}
export type TypedPropsGroup<T> = {
  [K in keyof T]-?: {
    type: PropType<T[K]>;
    required: T extends { [key in K]-?: T[K] } ? true : false;
    default?: any;
    validator?: any;
  };
};
export const UNSAFE_STORE_PROPS_KEY = "@props";
const UNSAFE_WALKER = () => null;
export function extractProps<T>(target: Types.Consturctor<T>): TypedPropsGroup<T> {
  if (target instanceof Vue) {
    return ((target as any)["options"] as ComponentOptions<any, any, any, any, any>)["props"];
  }
  // console.log(target.props);
  return target[UNSAFE_STORE_PROPS_KEY as unknown as string] ?? target.props;
}

/**
 * 从PropsClass中提取Vue props配置集合
 *
 * 提取出来的props配置中不会包含类型校验配置，因此vue不会检查props
 *
 * 相对的，提供返回数组中第二个函数作为手动进行props处理的方法
 *
 * @param target 配置的PropsClass
 *
 * @param configure 在处理完之后的hooks，传入props作为参数然后返回修改后的props
 * @returns
 */
export function extractUnsafeProps<T, R extends T>(
  target: Types.Consturctor<T>,
  configure?: (props: T) => R
) {
  const propDefinitions = extractPropsWith(target, UNSAFE_WALKER) as TypedPropsGroup<T>;
  // console.log(target.props);
  const extractor = createPropExtractor<T, R>(extractProps(target), configure);
  return [
    // 返回props集合
    propDefinitions,
    (
      props: Partial<T>,
      walker: (
        propName: keyof T,
        propValue: T[typeof propName] | undefined | null,
        options: TypedPropOptions<any, boolean>
      ) => any
    ) => {
      return extractor(props, walker) as R;
    },
  ] as const;
}

export function createPropExtractor<T, R extends T>(
  source: TypedPropsGroup<T>,
  configure?: (props: T) => R
) {
  return (
    props: Partial<T>,
    walker: (
      propName: keyof T,
      propValue: T[typeof propName] | undefined | null,
      options: TypedPropOptions<any, boolean>
    ) => any
  ): R => {
    const p = {} as T;
    for (const key in source) {
      const options = ((source[key] instanceof Function ? { type: source[key] } : source[key]) ||
        {}) as TypedPropOptions<any, boolean>;
      const resolve = walker(key, props[key]!, options);
      const isSimpleType = _isSimpleType(options.type);
      if (isSimpleType) {
        p[key] = resolve ?? options.default;
      } else {
        p[key] = resolve || ("default" in options && options.default()) || void 0;
      }
    }
    return configure ? configure(p) : (p as unknown as R);
  };
}
/**
 * 判断是否为简单类型
 *
 * 1.default不为factory类型
 *
 * 2.进行非空判断需要使用 `??` 而非 `||` 以便正确判断 (false/""/0)
 * @param type
 */
const _isSimpleType = (type: any): boolean => {
  if (type instanceof Array && type.length > 0) return type.every(_isSimpleType);
  return [Boolean, Number, String, Function, null, void 0, false].includes(type);
};

export function extractPropsWith<T>(
  target: Types.Consturctor<T>,
  walker?: (type: any, key: keyof T) => any
): TypedPropsGroup<T> {
  const source: TypedPropsGroup<T> = target[UNSAFE_STORE_PROPS_KEY as unknown as string];
  if (!walker) return source;
  const p = {} as TypedPropsGroup<T>;
  for (const key in source) {
    p[key] = walker(source[key], key);
  }
  return p;
}
export function Prop<Required extends boolean>(
  options?:
    | null
    | TypedPropOptions<any, Required>
    | Types.Consturctor<any>[]
    | Types.Consturctor<any>
) {
  return (target: any, key: string) => {
    // console.log("collect prop", target?.constructor?.name, key);
    let props = target.constructor[UNSAFE_STORE_PROPS_KEY];
    if (!props) {
      props = {};
      target.constructor[UNSAFE_STORE_PROPS_KEY] = props;
    }
    if (Object.isSealed(props)) {
      props = { ...props };
    }
    props[key] = options || null;
    target.constructor[UNSAFE_STORE_PROPS_KEY] = props;
  };
}

export function Component(options?: any) {
  return (target: any) => {
    // console.log("collect props", target);
    const props = extractProps(target);
    if (!Object.isSealed(props)) {
      target[UNSAFE_STORE_PROPS_KEY] = target.sealedOptions?.props
        ? Object.seal({ ...props, ...target.sealedOptions.props })
        : Object.seal(props);
    }
    if (target instanceof Vue) {
      console.log(target.sealedOptions.props);
    }
    Object.defineProperty(target, "options", {
      get() {
        const { [UNSAFE_STORE_PROPS_KEY]: props, ...other } = target;
        console.log("collect props", target?.name, props, target);
        return { ...other, props };
      },
      enumerable: false,
    });
  };
}
export function getPropsClass<
  T extends TPropProvider<Vue>,
  Props extends VCProps<InstanceType<T>, false>
>(
  component: T,
  replaceInitProps?: Partial<VCProps<InstanceType<T>, false>>
): (new () => Props) & {
  model: VModelDefine<Types.KeyOf<Props>>;
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
  model: VModelDefine<Exclude<Types.KeyOf<Props>, PropKey>>;
  props: TypedPropsGroup<Resolver>;
  // [UNSAFE_STORE_PROPS_KEY]: TypedPropsGroup<Resolver>;
};
export function getPropsClass<Props extends Types.Recordable, PropKey extends Types.KeyOf<Props>>(
  component: any,
  replaceInitProps?: Partial<Props>,
  ...igronProps: PropKey[]
): (new () => Props) & {
  model: VModelDefine<PropKey>;
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
    [UNSAFE_STORE_PROPS_KEY]: nextProps,
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
          default: isObject ? () => replaceInitProps[key] : replaceInitProps[key],
        };
        // (propsOptions.def && propsOptions.def(replaceInitProps[key])) || (propsOptions.default = replaceInitProps[key])
      }
    }
  }
  return props;
}

type Required<T, K extends keyof T> = {
  [Key in Exclude<keyof T, K extends false | undefined ? never : K>]+?: T[Key];
} &
  {
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

export abstract class HookFactory<Props = {}> {
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
  $once(event: string | string[], callback: Function) {
    return this.$instance.$once(event, callback);
  }
  $on(event: string | string[], callback: Function) {
    return this.$instance.$on(event, callback);
  }
  public $install?(props: Props): void | (() => void);
}

export function useHookFactory<Props, F extends HookFactory<Props>, Args extends any[]>(
  Factory: Types.ConstructorType<F, [context: SetupContext, props: Props, ...args: Args]>,
  context: SetupContext,
  props: Props,
  ...args: Args
): F {
  const store = reactive(new Factory(context, props, ...args)) as F;
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

export function PropsMixins<A>(CtorA: TPropProvider<A>): TPropProvider<A>;
export function PropsMixins<A, B>(
  CtorA: TPropProvider<A>,
  CtorB: TPropProvider<B>
): TPropProvider<A & B>;
export function PropsMixins<A, B, C>(
  CtorA: TPropProvider<A>,
  CtorB: TPropProvider<B>,
  CtorC: TPropProvider<C>
): TPropProvider<A & B & C>;
export function PropsMixins<A, B, C, D>(
  CtorA: TPropProvider<A>,
  CtorB: TPropProvider<B>,
  CtorC: TPropProvider<C>,
  CtorD: TPropProvider<D>
): TPropProvider<A & B & C & D>;
export function PropsMixins<A, B, C, D, E>(
  CtorA: TPropProvider<A>,
  CtorB: TPropProvider<B>,
  CtorC: TPropProvider<C>,
  CtorD: TPropProvider<D>,
  CtorE: TPropProvider<E>
): TPropProvider<A & B & C & D & E>;
export function PropsMixins<T>(...Ctors: TPropProvider<any>[]): TPropProvider<T>;
export function PropsMixins(...Ctors: TPropProvider<any>[]) {
  //@ts-ignore
  return Vue.extend({ mixins: Ctors }) as TPropProvider<T>;
}
