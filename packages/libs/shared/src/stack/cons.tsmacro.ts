export const cons = function cons<T>(x: T, y: Cons<T>): Cons<T> {
  return function (lambda: ConsItem<T> | ConsStack<T>) {
    return lambda(x, y);
  } as Cons<T>;
};
export function returnItem<T>(i: T): T {
  return i;
}
export function returnStack<T>(_: T, stack: Cons<T>): Cons<T> {
  return stack;
}

export type ConsItem<T> = (i: T, stack: Cons<T>) => T;
export type ConsStack<T> = (i: T, stack: Cons<T>) => Cons<T>;

export interface Cons<T> {
  (lambda: ConsItem<T>): T;
  (lambda: ConsStack<T>): Cons<T>;
}
