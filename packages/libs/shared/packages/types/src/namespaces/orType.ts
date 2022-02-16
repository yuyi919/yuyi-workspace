import { Function } from "./namespaces";

/**
 * @beta
 */
export type OrAsync<T> = T | Promise<T>;
/**
 * @beta
 */
export type OrCallback<T, Args extends [] = []> = T | Function.Base<Args, T>;

/**
 * @beta
 */
export type OrAsyncCallback<T, Args extends [] = []> = OrCallback<Promise<T>, Args>;

/**
 * @beta
 */
export type OrAwaitableCallback<T, Args extends [] = []> = OrCallback<OrAsync<T>, Args>;

/**
 * @beta
 */
export type OrDynamicImportCallback<
  T,
  Args extends [] = [],
  Imported = { default: T }
> = OrAwaitableCallback<T | Imported, Args>;
