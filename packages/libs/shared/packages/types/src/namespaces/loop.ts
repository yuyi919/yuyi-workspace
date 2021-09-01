import { TKey } from "./shared";

export type LoopIterator<T, K extends TKey, TResult = void> = (
  currentValue: T,
  currentIndex: K,
  array: T[]
) => TResult;
export type ArrayIterator<T, TResult = void> = LoopIterator<T, number, TResult>;
