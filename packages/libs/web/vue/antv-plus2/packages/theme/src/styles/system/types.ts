/**
 * Remove properties `K` from `T`.
 * Distributive for union types.
 *
 * @internal
 */
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

/**
 * Generate a set of string literal types with the given default record `T` and
 * override record `U`.
 *
 * If the property value was `true`, the property key will be added to the
 * string union.
 *
 * @internal
 */
export type OverridableStringUnion<T extends string | number, U = {}> = GenerateStringUnion<
  Overwrite<Record<T, true>, U>
>;

/**
 * Like `T & U`, but using the value types from `U` where their properties overlap.
 *
 * @internal
 */
export type Overwrite<T, U> = DistributiveOmit<T, keyof U> & U;

/**
 *
 * @internal
 */
export type GenerateStringUnion<T> = Extract<
  {
    [Key in keyof T]: true extends T[Key] ? Key : never;
  }[keyof T],
  string
>;

export type PropsFor<SomeStyleFunction> = SomeStyleFunction extends StyleFunction<infer Props>
  ? Props
  : never;
export type StyleFunction<Props> = (props: Props) => any;
export type SimpleStyleFunction<PropKey extends keyof any> = StyleFunction<
  Partial<Record<PropKey, any>>
>;
