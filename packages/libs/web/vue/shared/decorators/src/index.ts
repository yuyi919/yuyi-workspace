import { Types } from "@yuyi919/shared-types";
import Vue, { ComponentOptions } from "vue";
import { PropType } from "vue-demi";
import { default as PropTypes, initDefaultProps } from "./prop-types";

export interface ITypedPropOptions<T, Required extends boolean> {
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
    return ((target as any).options as ComponentOptions<any, any, any, any, any>).props;
  }
  // console.log(target.props);
  return target[UNSAFE_STORE_PROPS_KEY as unknown as string] ?? target.props;
}

export type WalkHandler<T, R extends T> = (
  props: Partial<T>,
  walker: (
    propName: keyof T,
    propValue: T[keyof T] | undefined | null,
    options: ITypedPropOptions<any, boolean>
  ) => any
) => R;

/**
 * 从PropsClass中提取Vue props配置集合
 *
 * 提取出来的props配置中不会包含类型校验配置，因此vue不会检查props
 *
 * 相对的，提供返回数组中第二个函数作为手动进行props处理的方法
 *
 * @param target - 配置的PropsClass
 *
 * @param configure - 在处理完之后的hooks，传入props作为参数然后返回修改后的props
 * @returns
 */
export function extractUnsafeProps<T, R extends T>(
  target: Types.Consturctor<T>,
  configure?: (props: T) => R
): readonly [TypedPropsGroup<T>, WalkHandler<T, R>] {
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
        options: ITypedPropOptions<any, boolean>
      ) => any
    ) => {
      return extractor(props, walker) as R;
    }
  ];
}

/**
 * 判断是否为简单类型
 *
 * 1.default不为factory类型
 *
 * 2.进行非空判断需要使用 `??` 而非 `||` 以便正确判断 (false/""/0)
 * @param type -
 */
const _isSimpleType = (type: any): boolean => {
  if (type instanceof Array && type.length > 0) return type.every(_isSimpleType);
  return [Boolean, Number, String, Function, null, void 0, false].includes(type);
};
export function createPropExtractor<T, R extends T>(
  source: TypedPropsGroup<T>,
  configure?: (props: T) => R
) {
  return (
    props: Partial<T>,
    walker: (
      propName: keyof T,
      propValue: T[typeof propName] | undefined | null,
      options: ITypedPropOptions<any, boolean>
    ) => any
  ): R => {
    const p = {} as T;
    // eslint-disable-next-line guard-for-in
    for (const key in source) {
      const options = ((source[key] instanceof Function ? { type: source[key] } : source[key]) ||
        {}) as ITypedPropOptions<any, boolean>;
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

export function extractPropsWith<T>(
  target: Types.Consturctor<T>,
  walker?: (type: any, key: keyof T) => any
): TypedPropsGroup<T> {
  const source: TypedPropsGroup<T> = target[UNSAFE_STORE_PROPS_KEY as unknown as string];
  if (!walker) return source;
  const p = {} as TypedPropsGroup<T>;
  // eslint-disable-next-line guard-for-in
  for (const key in source) {
    p[key] = walker(source[key], key);
  }
  return p;
}
export function Prop<Required extends boolean>(
  options?:
    | null
    | ITypedPropOptions<any, Required>
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
      console.debug(target.sealedOptions.props);
    }
    Object.defineProperty(target, "options", {
      get() {
        const { [UNSAFE_STORE_PROPS_KEY]: props, ...other } = target;
        console.debug("collect props", target?.name, props, target);
        return { ...other, props };
      },
      enumerable: false
    });
  };
}

export { PropTypes, initDefaultProps };

/**
 * @param ctorA -
 */
export function MergeProps<A>(ctorA: Types.ConstructorType<A>): Types.ConstructorType<A>;
export function MergeProps<A, B>(
  ctorA: Types.ConstructorType<A>,
  ctorB: Types.ConstructorType<B>
): Types.ConstructorType<A & B>;
export function MergeProps<A, B, C>(
  ctorA: Types.ConstructorType<A>,
  ctorB: Types.ConstructorType<B>,
  ctorC: Types.ConstructorType<C>
): Types.ConstructorType<A & B & C>;
export function MergeProps<A, B, C, D>(
  ctorA: Types.ConstructorType<A>,
  ctorB: Types.ConstructorType<B>,
  ctorC: Types.ConstructorType<C>,
  ctorD: Types.ConstructorType<D>
): Types.ConstructorType<A & B & C & D>;
export function MergeProps<A, B, C, D, E>(
  ctorA: Types.ConstructorType<A>,
  ctorB: Types.ConstructorType<B>,
  ctorC: Types.ConstructorType<C>,
  ctorD: Types.ConstructorType<D>,
  ctorE: Types.ConstructorType<E>
): Types.ConstructorType<A & B & C & D & E>;

export function MergeProps(...ctors: Types.ConstructorType<any>[]) {
  //@ts-ignore
  return Vue.extend({
    mixins: ctors.map((props) => {
      return { props: extractProps(props) };
    })
  }) as any;
}
