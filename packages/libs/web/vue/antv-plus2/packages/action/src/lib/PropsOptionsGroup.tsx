import { PropOptions as PropOptionsRequired } from "vue-demi";
import { PropValidator } from "vue/types/options";

export type PropsOption<T extends any> = PropOptionsRequired<T> | PropValidator<T>;

/**
 * @deprecated 请使用[TypedPropsGroup]
 */
export type PropsOptionsGroup<T extends any> = {
  [K in keyof T]: PropsOption<T[K]>;
};

/**
 * @deprecated 请使用[TypedPropsGroup]
 */
export type TypedPropsOptions<T> = {
  [K in keyof T]: PropOptionsRequired<T[K]>;
};
