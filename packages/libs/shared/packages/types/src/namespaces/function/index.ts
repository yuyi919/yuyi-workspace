/**
 * @beta
 */
export type Base<Args extends any[] = any[], Result = any> = (...args: Args) => Result;
/**
 * @beta
 */
export type ReturnType<F, Default = any> = F extends Base<any, infer R> ? R : Default;
/**
 * @beta
 */
export type Bind1<A, Args extends any[] = [], Result = any> = (a: A, ...args: Args) => Result;
/**
 * @beta
 */
export type Bind2<A, B, Args extends any[] = [], Result = any> = (
  a: A,
  b: B,
  ...args: Args
) => Result;
/**
 * @beta
 */
export type Bind3<A, B, C, Args extends any[] = [], Result = any> = (
  a: A,
  b: B,
  c: C,
  ...args: Args
) => Result;
/**
 * @beta
 */
export type Bind4<A, B, C, D, Args extends any[] = [], Result = any> = (
  a: A,
  b: B,
  c: C,
  d: D,
  ...args: Args
) => Result;
/**
 * @beta
 */
export type Arg0<F> = F extends Bind1<infer T, any[]> ? T : any;
/**
 * @beta
 */
export type Arg1<F> = F extends Bind2<any, infer T, any[]> ? T : any;
/**
 * @beta
 */
export type Arg2<F> = F extends Bind3<any, any, infer T, any[]> ? T : any;
/**
 * @beta
 */
export type Arg3<F> = F extends Bind4<any, any, any, infer T, any[]> ? T : any;
/**
 * @beta
 */
export type ExtractArgs<T, Default = []> = T extends (...args: infer Args) => any ? Args : Default;
/**
 * @beta
 */
export type Shift1<T, A> = T extends Bind1<A, infer Args, infer Re> ? Base<Args, Re> : Function;
/**
 * @beta
 */
export type Shift2<T, A, B> = T extends Bind2<A, B, infer Args, infer Re>
  ? Base<Args, Re>
  : Function;
/**
 * @beta
 */
export type Shift3<T, A, B, C> = T extends Bind3<A, B, C, infer Args, infer Re>
  ? Base<Args, Re>
  : Function;
/**
 * @beta
 */
export type Shift4<T, A, B, C, D> = T extends Bind4<A, B, C, D, infer Args, infer Re>
  ? Base<Args, Re>
  : Function;
