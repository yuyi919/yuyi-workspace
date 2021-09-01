import { Function } from "./namespaces";

export type OrAsync<T> = T | Promise<T>;
export type OrCallback<T, Args extends [] = []> = T | Function.Base<Args, T>;

export type OrAsyncCallback<T, Args extends [] = []> = OrCallback<Promise<T>, Args>;

export type OrAwaitableCallback<T, Args extends [] = []> = OrCallback<OrAsync<T>, Args>;

export type OrDynamicImportCallback<
  T,
  Args extends [] = [],
  Imported = { default: T }
> = OrAwaitableCallback<T | Imported, Args>;
