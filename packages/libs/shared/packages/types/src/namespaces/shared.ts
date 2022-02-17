import { Types } from ".";
import { Properties as CSSProperties } from "csstype";
import { OrAsync } from "./orType";

/**
 * @beta
 */
export type Key = string | number;
/**
 * 取得对象的所有值类型，相对于Keyof
 */
/**
 * @beta
 */
export type ValueOf<T> = T[keyof T];

/**
 * @beta
 */
export type Type<T> = {
  [K in keyof T]: T[K];
};
/**
 * 参照关键字keyof，可以排除指定类型，默认排除number和symbol
 */
/**
 * @beta
 */
export type KeyOf<T, ExcludeType = symbol | number> = Exclude<keyof T, ExcludeType>;

/**
 * @beta
 */
export type DynamicString = string & {};
/**
 * @beta
 */
export type DynamicNumber = number & {};
/**
 * @beta
 */
export type Awesome =
  | string
  | Record<TKey, any>
  | number
  | boolean
  | Types.Function.Base
  | any[]
  | symbol;
/**
 * @beta
 */
export type FullTypes =
  | string
  | Record<TKey, any>
  | number
  | boolean
  | Types.Function.Base
  | any[]
  | symbol
  | null
  | undefined;

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
 * @beta
 */
export type ConstructorType<T, Args extends any[] = [any?, any?, ...any[]]> = new (
  ...args: Args
) => T;

/**
 * @beta
 */
export type TKey = string | number | symbol;

/**
 * @beta
 */
export type Getter<T, Args extends [any?, any?, any?, any?] = []> = Types.Function.Base<Args, T>;

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
export type Consturctor<T, Args extends any[] = []> = {
  new (...args: Args): T;
} & {
  [key in string | symbol]: any;
};

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
 * @deprecated 使用Re
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
 * {@inheritDoc NonNullable}
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

export * from "./typecheck";
export * from "./loop";
export * from "./orType";

export type { CSSProperties };
