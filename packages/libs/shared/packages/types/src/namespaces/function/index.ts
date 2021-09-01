export type Base<Args extends any[] = any[], Result = any> = (...args: Args) => Result;
export type ReturnType<F, Default = any> = F extends Base<any, infer R> ? R : Default;

export type Bind1<A, Args extends any[] = [], Result = any> = (a: A, ...args: Args) => Result;
export type Bind2<A, B, Args extends any[] = [], Result = any> = (
  a: A,
  b: B,
  ...args: Args
) => Result;
export type Bind3<A, B, C, Args extends any[] = [], Result = any> = (
  a: A,
  b: B,
  c: C,
  ...args: Args
) => Result;

export type Arg0<T> = T extends Bind1<infer T, any[]> ? T : any;
export type Arg1<T> = T extends Bind2<any, infer T, any[]> ? T : any;
export type Arg2<T> = T extends Bind3<any, any, infer T, any[]> ? T : any;
export type ExtractArgs<T, Default = []> = T extends (...args: infer Args) => any ? Args : Default;

export type Shift1<T, A> = T extends Bind1<A, infer Args, infer Re> ? Base<Args, Re> : Function;
export type Shift2<T, A, B> = T extends Bind2<A, B, infer Args, infer Re>
  ? Base<Args, Re>
  : Function;
export type Shift3<T, A, B, C> = T extends Bind3<A, B, C, infer Args, infer Re>
  ? Base<Args, Re>
  : Function;
