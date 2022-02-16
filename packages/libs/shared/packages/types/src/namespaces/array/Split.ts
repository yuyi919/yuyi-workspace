/**
 * @beta
 */
export type SplitWith<
  List extends any[],
  Match extends any,
  Cache extends any[] = []
> = List extends [infer Item, ...infer Other]
  ? Other extends any[]
    ? Item extends any
      ? Item extends Match
        ? [Cache, Other]
        : SplitWith<Other, Match, [...Cache, Item]>
      : [List, never]
    : [List, never]
  : [List, never];

/**
 * @beta
 */
export type Split<List extends any[], Match extends any> = SplitWith<List, Match>;

/**
 * 类似于 [first, ...other] 返回other
 */
/**
 * @beta
 */
export type RestOther<
  List extends any[] | readonly any[],
  Cache extends List[number][] = []
> = List extends readonly [infer Item, ...infer Other]
  ? Item extends any
    ? Other extends [any, ...any[]]
      ? Other
      : never
    : RestOther<Other, [any, ...Cache, Item]>
  : List extends [infer Item, ...infer Other]
  ? Item extends any
    ? Other extends [any, ...any[]]
      ? Other
      : never
    : RestOther<Other, [any, ...Cache, Item]>
  : never;

// type R = Split<
//   ["a", "?", "b", ",", "c", "?", "b", ",", "c", "?", "b", ",", "c", "?", "b", ",", "c"],
//   "," | "?"
// >;
