export type IsTargetTyped<TargetType, T, TRUE, FALSE> = T extends TargetType ? TRUE : FALSE;
export type IsTargetTypedRe<TargetType, T, TRUE, FALSE> = TargetType extends T ? TRUE : FALSE;
/**
 * 对于对象类型判断是否为any的条件类型
 * @typeParam T - Target
 * @typeParam TRUE - Target类型为any时的类型
 * @typeParam FALSE - 除此以外时的类型
 */
export type IsEmptyObj<T = unknown, TRUE = true, FALSE = false> = IsTargetTyped<
  { [key: string]: never },
  T,
  TRUE,
  FALSE
>;
export type IsEmptyArr<T = unknown, TRUE = true, FALSE = false> = IsTargetTyped<[], T, TRUE, FALSE>;
export type IsAny<T = unknown, TRUE = true, FALSE = false> = IsEmptyObj<
  T,
  FALSE,
  IsTargetTypedRe<unknown, T, TRUE, FALSE>
>;
export type IsUnknown<T = unknown, TRUE = true, FALSE = false> = IsTargetTypedRe<
  unknown,
  T,
  TRUE,
  FALSE
>;
export type IsArray<T = unknown, TRUE = true, FALSE = false> = IsUnknown<
  T,
  FALSE,
  T extends Array<any> ? TRUE : FALSE
>;
export type IsBaseType<T = unknown, TRUE = true, FALSE = false> = IsAny<
  T,
  FALSE,
  T extends string | number | boolean | Function ? TRUE : FALSE
>;
export type IsObject<T = unknown, TRUE = true, FALSE = false> = IsAny<
  T,
  FALSE,
  IsBaseType<T, FALSE, IsArray<T, FALSE, T extends object | {} ? TRUE : FALSE>>
>;

export type IsClasses<T = unknown, TRUE = true, FALSE = false> = IsObject<
  T,
  IsEmptyObj<T, FALSE, IsBaseType<T, FALSE, T extends InstanceType<any> ? TRUE : FALSE>>,
  FALSE
>;
export type t = IsClasses<any>;
export type IsTrue<T = unknown, TRUE = true, FALSE = false> = IsTargetTyped<true, T, TRUE, FALSE>;
export type IsNil<T = unknown, TRUE = true, FALSE = false> = IsTargetTyped<
  false | undefined | never,
  T,
  TRUE,
  FALSE
>;
export type BaseType = string | number | boolean | Function | undefined | null;
