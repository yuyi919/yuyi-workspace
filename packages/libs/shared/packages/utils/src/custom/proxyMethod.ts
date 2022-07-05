/**
 *
 * @param target -
 * @param methodName -
 * @param hacker -
 * @beta
 */
export function proxyMethod<
  T extends any,
  K extends keyof T,
  Args extends T[K] extends (...args: infer Arg) => any ? Arg : [],
  Result extends T[K] extends (...args: any[]) => infer R ? R : []
>(
  target: { new (...args: any[]): T },
  methodName: K,
  hacker: (
    target: T,
    sourceHandle: OmitThisParameter<(...args: Args) => Result>,
    ...args: Args
  ) => any
) {
  const handle: (this: T, ...args: Args) => any = target.prototype[methodName];
  target.prototype[methodName] = function (this: T, ...args: Args) {
    return hacker.apply(this, [this, (handle as any).bind(this), ...args] as [
      T,
      OmitThisParameter<(...args: Args) => Result>,
      ...Args
    ]);
  };
}

/**
 *
 * @param target -
 * @param methodName -
 * @param hacker -
 * @beta
 */
export function overwriteMethod<
  T extends any,
  K extends keyof T,
  Args extends T[K] extends (...args: infer Arg) => any ? Arg : [],
  Result extends T[K] extends (...args: any[]) => infer R ? R : []
>(
  target: { new (...args: any[]): T },
  methodName: K,
  hacker: (target: T, ...args: Args) => Result
) {
  target.prototype[methodName] = function (this: T, ...args: Args) {
    return hacker.apply(this, [this, ...args] as [T, ...Args]);
  };
}
/**
 *
 * @param target -
 * @param methodName -
 * @param hacker -
 * @beta
 */
export function proxyMethodAfter<
  T extends any,
  K extends keyof T,
  Args extends T[K] extends (...args: infer Arg) => any ? Arg : [],
  Result extends T[K] extends (...args: any[]) => infer R ? R : []
>(
  target: { new (...args: any[]): T },
  methodName: K,
  hacker: (target: T, result: Result, ...args: Args) => any
) {
  const handle: (this: T, ...args: Args) => any = target.prototype[methodName];
  target.prototype[methodName] = function (this: T, ...args: Args) {
    const result: Result = handle.apply(this, args);
    return hacker.apply(this, [this, result, ...args] as [T, Result, ...Args]);
  };
}
/**
 *
 * @param target -
 * @param methodName -
 * @param hacker -
 * @beta
 */
export function proxyStaticMethod<
  T extends Record<string, any>,
  K extends keyof T,
  Args extends T[K] extends (...args: infer Arg) => any ? Arg : [],
  Result extends T[K] extends (...args: any[]) => infer R ? R : []
>(
  target: T,
  methodName: K,
  hacker: (
    target: T,
    sourceHandle: OmitThisParameter<(...args: Args) => Result>,
    ...args: Args
  ) => any
) {
  const handle: (this: T, ...args: Args) => any = target[methodName];
  target[methodName] = function (this: T, ...args: Args) {
    return hacker.apply(this, [this, (handle as any).bind(this), ...args] as [
      T,
      OmitThisParameter<(...args: Args) => Result>,
      ...Args
    ]);
  } as T[K];
}

/**
 *
 * @param target -
 * @param methodName -
 * @param hacker -
 * @beta
 */
export function proxyStaticMethodAfter<
  T extends Record<string, any>,
  K extends keyof T,
  Args extends T[K] extends (...args: infer Arg) => any ? Arg : [],
  Result extends T[K] extends (...args: any[]) => infer R ? R : []
>(target: T, methodName: K, hacker: (target: T, result: Result, ...args: Args) => any) {
  const handle: (this: T, ...args: Args) => any = target[methodName];
  target[methodName] = function (this: T, ...args: Args) {
    const result: Result = handle.apply(this, args);
    return hacker.apply(this, [this, result, ...args] as [T, Result, ...Args]);
  } as T[K];
}

/**
 *
 * @param target -
 * @param methodName -
 * @param hacker -
 * @beta
 */
export function overwriteStaticMethod<
  T extends any,
  K extends keyof T,
  Args extends T[K] extends (...args: infer Arg) => any ? Arg : [],
  Result extends T[K] extends (...args: any[]) => infer R ? R : []
>(target: T, methodName: K, hacker: (target: T, ...args: Args) => Result) {
  target[methodName] = function (this: T, ...args: Args) {
    return hacker.apply(this, [this, ...args] as [T, ...Args]);
  } as unknown as T[K];
}
