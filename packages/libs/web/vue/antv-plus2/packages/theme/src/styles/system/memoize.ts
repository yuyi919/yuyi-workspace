export function memoize<Args extends string, R extends any>(fn: (args: Args) => R) {
  const cache: Record<string, any> = {};

  return ((arg) => {
    if (cache[arg] === undefined) {
      cache[arg] = fn(arg);
    }
    return cache[arg];
  }) as (args: Args) => R;
}
