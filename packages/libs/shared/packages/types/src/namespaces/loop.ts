import { TKey } from "./shared";

/**
 * @alpha
 */
export type LoopIterator<T, K extends TKey, TResult = void> = (
  currentValue: T,
  currentIndex: K,
  array: T[]
) => TResult;
/**
 * @alpha
 */
export type ArrayIterator<T, TResult = void> = LoopIterator<T, number, TResult>;
