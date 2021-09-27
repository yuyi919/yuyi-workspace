export function reverseKV<
  Target extends Record<string, any>,
  Keys extends keyof Target,
  Result extends {
    [ValueKey in Target[Keys]]: Extract<
      { [Key in Keys]: [Target[Key], Key] }[Keys],
      [ValueKey, any]
    >[1];
  }
>(target: Target): Result {
  const r = {} as any;
  for (const key in target) {
    //@ts-ignore
    r[target[key]] = key;
  }
  return r;
}

export type TReverseKV<
  Source extends Record<string, any>,
  Keys extends keyof Source = keyof Source
> = {
  [ValueKey in Source[Keys]]: Extract<
    { [Key in Keys]: [Source[Key], Key] }[Keys],
    [ValueKey, any]
  >[1];
};

/**
 * 测试
 */
type Source = {
  A: 1;
  B: 2;
};
type Result = TReverseKV<Source>; // { 1: "A"; 2: "B"; }
