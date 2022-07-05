import { Fn } from "./namespaces";

/**
 * @beta
 */
export type OrAsync<T> = T | Promise<T>;

/**
 * @beta
 */
export type OrCallback<T, Args extends unknown[] = []> = T | Fn<Args, T>;

/**
 * @beta
 */
export type OrAsyncCallback<T, Args extends unknown[] = []> = OrCallback<Promise<T>, Args>;

/**
 * @beta
 */
export type OrAwaitableCallback<T, Args extends unknown[] = []> = OrCallback<OrAsync<T>, Args>;

/**
 * @beta
 */
export type OrDynamicImportCallback<
  T,
  Args extends unknown[] = [],
  Imported = { default: T }
> = OrAwaitableCallback<T | Imported, Args>;
