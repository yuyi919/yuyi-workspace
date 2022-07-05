import { Types } from ".";
import type { Properties as CSSProperties } from "csstype";
import { OrAsync } from "./orType";

/**
 * 取得对象的所有值类型，相对于Keyof
 */
/**
 * @public
 */
export type ValueOf<T> = T[keyof T];

/**
 * @public
 */
export type Type<T> = {
  [K in keyof T]: T[K];
};
/**
 * 参照关键字keyof，可以排除指定类型，默认排除number和symbol
 */
/**
 * @public
 */
export type KeyOf<T, ExcludeType = symbol | number> = Exclude<keyof T, ExcludeType>;

/**
 * @public
 */
export type DynamicString = string & {};

/**
 * @public
 */
export type DynamicNumber = number & {};

/**
 * @public
 */
export type Primitive = NotNilPrimitive | null | undefined;

/**
 * @public
 */
export type NotNilPrimitive = string | number | boolean | symbol;

/**
 * @beta
 */
export type Awesome = Record<TKey, any> | Types.Function.Base | any[] | NotNilPrimitive;

/**
 * @beta
 */
export type FullTypes = Record<TKey, any> | Types.Function.Base | any[] | Primitive;

/**
 * @beta
 */
export type ExcludeType<T> = Exclude<Awesome, T>;

/**
 * @beta
 */
export type Plain<K extends string, V = any> = Record<K, V>;

/**
 * @beta
 */
export type IKeyValueMap<V = any> = Plain<string, V>;

/**
 * @beta
 */
export type AnyConstructorType<A = IKeyValueMap> = new (...input: any[]) => A;

/**
 * 类型化构造函数
 * @public
 */
export type ConstructorType<T, Args extends any[] = [any?, any?, ...any[]]> = new (
  ...args: Args
) => T;

/**
 * 类型化构造函数
 * @public
 */
export type InstanceKey<T extends ConstructorType<any>> = keyof InstanceType<T>;

/**
 * 带构造函数的对象
 * @public
 */
export type Consturctor<T, Args extends any[] = []> = {
  new (...args: Args): T;
} & {
  [key in string | symbol]: any;
};

/**
 * 取得构造函数的参数
 * @public
 */
export type ConstructorArgs<T> = T extends ConstructorType<any, infer Args> ? Args : [];

/**
 * @public
 */
export type TKey = string | number | symbol;

/**
 * @beta
 */
export type Getter<T, Args extends [any?, any?, any?, any?] = []> = Types.Function.Base<Args, T>;

/**
 * @beta
 */
export type ToGetter<
  Target extends Record<string, any>,
  OtherArgs extends [any?, any?, any?, any?] = []
> = {
  [K in keyof Target]: Getter<Target[K], OtherArgs>;
};

/**
 * @beta
 */
export type TSetter<V, OtherArgs extends [any?, any?, any?, any?] = []> = Types.Function.Base<
  [arg: V, ...others: OtherArgs]
>;

/**
 * @beta
 */
export type ToSetter<
  Target extends Record<string, any>,
  OtherArgs extends [any?, any?, any?, any?] = []
> = {
  [K in keyof Target]: TSetter<Target[K], OtherArgs>;
};

/**
 * @beta
 */
export type Factory<T, Args extends [any?, any?, any?, any?] = []> = T | Getter<T, Args>;

/**
 * @beta
 */
export type Fetcher<T, Args extends [] = []> = OrAsync<T> | Types.Function.Base<Args, OrAsync<T>>;

/**
 * @beta
 */
export type RequiredTo<T, Keys extends keyof T = keyof T> = {
  [P in Keys]-?: T[P];
} & Omit<T, Keys>;

/**
 * @beta
 */
export type PartialTo<T, Keys extends keyof T = keyof T> = {
  [P in Keys]+?: T[P];
} & Omit<T, Keys>;
/**
 * @beta
 */
export type PartialForward<T, Keys extends keyof T = keyof T> = {
  [P in Keys]: PartialTo<T[P]>;
} & Omit<T, Keys>;

/**
 * `Types.Function.Base<Args, Result>`的别名
 * @beta
 */
export type Fn<Args extends any[] = any[], R = any> = Types.Function.Base<Args, R>;

/**
 * @beta
 */
export type PromiseFn<Args extends any[] = any, R = any> = (...arg: Args) => Promise<R>;

/**
 * `ThenableValue`的别名
 * @beta
 */
export type PromiseValue<T> = ThenableValue<T>;
/**
 * @beta
 */
export type ThenableValue<T> = T extends PromiseLike<infer V> ? V : never;

/**
 * @beta
 */
export type WrapValue<T = any, GetterArgs extends any[] = []> =
  | ((...args: GetterArgs) => T | null | undefined)
  | { value?: T | null | undefined }
  | T
  | null
  | undefined;

/**
 * @beta
 */
export interface IObj<T = any> {
  [key: string]: T;
  [key: number]: T;
}

/**
 * @beta
 */
export type Nullable<T> = NonNullable<T> | null;

/**
 * @beta
 */
export type NonNilable<T> = T extends null | undefined ? never : T;

/**
 * @beta
 */
export type RefType<T> = T | null;

/**
 * @beta
 */
export type CustomizedHTMLElement<T> = HTMLElement & T;

/**
 * @beta
 */
export type Recordable<T extends any = any, Key extends string | number | symbol = string> = Record<
  Key,
  T
>;

/**
 * 包含`{ Key: T }`的Record
 */
/**
 * @beta
 */
export type RecordWithKey<Key extends string | symbol, T = any> = {
  [key in Key]: T;
} & Recordable<any>;
/**
 * 包含`{ Key?: T }`的Record
 */
/**
 * @beta
 */
export type RecordWithOptionalKey<Key extends string | symbol, T = any> = {
  [key in Key]?: T;
} & Recordable<any>;

/**
 * @internal
 */
export interface IReadonly<T extends any = any> {
  readonly [key: string]: T;
}

/**
 * 深度Partial
 * @beta
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

/**
 * 深度可选键，并且允许隐式转换
 * @example
 * ```ts
 * type Result = DeepImplicitConversionPartial<{ a: string,  b: { c: string } }>
 * // => { a?: number | string,  b?: { c?: number | string }
 * ```
 * @beta
 */
export type DeepImplicitConversionPartial<T> = {
  [P in keyof T]?: T[P] extends string | number
    ? string | number
    : DeepImplicitConversionPartial<T[P]>;
};
// export type DeepPartial<T> = T extends Function
//   ? T
//   : T extends object
//   ? { [K in keyof T]?: DeepPartial<T[K]> }
//   : T;

/**
 * @beta
 */
export type LabelValueOptions = {
  label: string;
  value: any;
}[];

/**
 * @beta
 */
export type EmitType = (event: string, ...args: any[]) => void;

/**
 * @beta
 */
export type TargetContext = "_self" | "_blank";

/**
 * @beta
 */
export type TimeoutHandle = ReturnType<typeof setTimeout>;

/**
 * @beta
 */
export type IntervalHandle = ReturnType<typeof setInterval>;

/**
 * @beta
 */
export interface IComponentElRef<T extends HTMLElement = HTMLDivElement> {
  $el: T;
}

/**
 * @beta
 */
export type ComponentRef<T extends HTMLElement = HTMLDivElement> = IComponentElRef<T> | null;

/**
 * @beta
 */
export type ElRef<T extends HTMLElement = HTMLDivElement> = Nullable<T>;

/**
 * @beta
 */
export type IsSame<A, B, True = true, False = false> = A | B extends A & B ? True : False;

/**
 * 排除never类型
 * @typeParam T - 目标类型
 * @typeParam Then - 不为never时返回的类型
 * @typeParam Catch - 为never时返回的类型
 * @public
 */
export type ExcludeNever<T, Then, Catch = never> = [T] extends [never] ? Catch : Then;

export * from "./typecheck";
export * from "./loop";
export * from "./orType";

export type { CSSProperties };

/**
 * 参照Array.prototype.sort的入参
 * @public
 */
export type CompareFn<T = any, T2 = T> = (a: T, b: T2) => number;
