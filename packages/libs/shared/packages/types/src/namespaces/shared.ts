import { Types } from ".";
import { Properties as CSSProperties } from "csstype";
import { OrAsync } from "./orType";

export type Key = string | number;
/**
 * 取得对象的所有值类型，相对于Keyof
 */
export type ValueOf<T> = T[keyof T];

export type Type<T> = {
  [K in keyof T]: T[K];
};
/**
 * 参照关键字keyof，可以排除指定类型，默认排除number和symbol
 */
export type KeyOf<T, ExcludeType = symbol | number> = Exclude<keyof T, ExcludeType>;

export type DynamicString = string & {};
export type DynamicNumber = number & {};
export type Awesome =
  | string
  | Record<TKey, any>
  | number
  | boolean
  | Types.Function.Base
  | any[]
  | symbol;
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

export type ExcludeType<T> = Exclude<Awesome, T>;

export type Plain<K extends string, V = any> = Record<K, V>;

export type IKeyValueMap<V = any> = Plain<string, V>;

export type AnyConstructorType<A = IKeyValueMap> = new (...input: any[]) => A;

export type ConstructorType<T, Args extends any[] = [any?, any?, ...any[]]> = {
  new (...args: Args): T;
};

export type TKey = string | number | symbol;

export type Getter<T, Args extends [any?, any?, any?, any?] = []> = Types.Function.Base<Args, T>;

export type Factory<T, Args extends [any?, any?, any?, any?] = []> = T | Getter<T, Args>;

export type Fetcher<T, Args extends [] = []> = OrAsync<T> | Types.Function.Base<Args, OrAsync<T>>;

export type { CSSProperties };

export type Consturctor<T, Args extends any[] = []> = {
  new (...args: Args): T;
} & {
  [key in string | symbol]: any;
};

export type Required<T, Keys extends keyof T = keyof T> = {
  [P in Keys]-?: T[P];
} &
  Omit<T, Keys>;

export type Partial<T, Keys extends keyof T = keyof T> = {
  [P in Keys]+?: T[P];
} &
  Omit<T, Keys>;
export type PartialForward<T, Keys extends keyof T = keyof T> = {
  [P in Keys]: Partial<T[P]>;
} &
  Omit<T, Keys>;

/**
 * @deprecated
 */
export interface Fn<T = any, R = T> {
  (...arg: T[]): R;
}

export interface PromiseFn<T = any, R = T> {
  (...arg: T[]): Promise<R>;
}
export type PromiseValue<T> = T extends Promise<infer V> ? V : never;

export type WrapValue<T = any, GetterArgs extends any[] = []> =
  | ((...args: GetterArgs) => T | null | undefined)
  | { value?: T | null | undefined }
  | T
  | null
  | undefined;
export interface IObj<T = any> {
  [key: string]: T;
  [key: number]: T;
}

export type Nullable<T> = T | null;

export type NonNullable<T> = T extends null | undefined ? never : T;

export type RefType<T> = T | null;

export type CustomizedHTMLElement<T> = HTMLElement & T;

export type Recordable<T extends any = any, Key extends string | number | symbol = string> = Record<
  Key,
  T
>;

/**
 * 包含{ Key: T }的Record
 */
export type RecordWithKey<Key extends string | symbol, T = any> = { [key in Key]: T } &
  Recordable<any>;
/**
 * 包含{ Key?: T }的Record
 */
export type RecordWithOptionalKey<Key extends string | symbol, T = any> = { [key in Key]?: T } &
  Recordable<any>;

export type Readonly<T extends any = any> = {
  readonly [key: string]: T;
};

/**
 * 深度Partial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

/**
 * 深度可选键，并且允许隐式转换
 * @example
 * type Result = DeepImplicitConversionPartial<{ a: string,  b: { c: string } }>
 * // => { a?: number | string,  b?: { c?: number | string }
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

export type LabelValueOptions = {
  label: string;
  value: any;
}[];

export type EmitType = (event: string, ...args: any[]) => void;

export type TargetContext = "_self" | "_blank";

export type TimeoutHandle = ReturnType<typeof setTimeout>;

export type IntervalHandle = ReturnType<typeof setInterval>;

export interface ComponentElRef<T extends HTMLElement = HTMLDivElement> {
  $el: T;
}

export type ComponentRef<T extends HTMLElement = HTMLDivElement> = ComponentElRef<T> | null;

export type ElRef<T extends HTMLElement = HTMLDivElement> = Nullable<T>;

export type IsSame<A, B, True = true, False = false> = A | B extends A & B ? True : False;

export * from "./typecheck";
export * from "./loop";
export * from "./orType";
