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
  const handle: (...args: Args) => any = target.prototype[methodName];
  target.prototype[methodName] = function (...args: Args) {
    return hacker.apply(this, [this, handle.bind(this), ...args] as [
      T,
      OmitThisParameter<(...args: Args) => Result>,
      ...Args
    ]);
  };
}
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
  target.prototype[methodName] = function (...args: Args) {
    return hacker.apply(this, [this, ...args] as [T, ...Args]);
  };
}
export function proxyMethodAfter<
  T extends { new (...args: any[]): any },
  K extends keyof InstanceType<T>,
  Args extends InstanceType<T>[K] extends (...args: infer Arg) => any ? Arg : [],
  Result extends InstanceType<T>[K] extends (...args: any[]) => infer R ? R : []
>(
  target: T,
  methodName: K,
  hacker: (target: InstanceType<T>, result: Result, ...args: Args) => any
) {
  const handle: (...args: Args) => any = target.prototype[methodName];
  target.prototype[methodName] = function (...args: Args) {
    const result: Result = handle.apply(this, args);
    return hacker.apply(this, [this, result, ...args] as [T, Result, ...Args]);
  };
}

export function proxyStaticMethodAfter<
  T extends Record<string, any>,
  K extends keyof T,
  Args extends T[K] extends (...args: infer Arg) => any ? Arg : [],
  Result extends T[K] extends (...args: any[]) => infer R ? R : []
>(target: T, methodName: K, hacker: (target: T, result: Result, ...args: Args) => any) {
  const handle: (...args: Args) => any = target[methodName];
  target[methodName] = function (...args: Args) {
    const result: Result = handle.apply(this, args);
    return hacker.apply(this, [this, result, ...args] as [T, Result, ...Args]);
  } as T[K];
}

export function overwriteStaticMethod<
  T extends any,
  K extends keyof T,
  Args extends T[K] extends (...args: infer Arg) => any ? Arg : [],
  Result extends T[K] extends (...args: any[]) => infer R ? R : []
>(target: T, methodName: K, hacker: (target: T, ...args: Args) => Result) {
  target[methodName] = (function (...args: Args) {
    return hacker.apply(this, [this, ...args] as [T, ...Args]);
  }) as unknown as T[K];
}
