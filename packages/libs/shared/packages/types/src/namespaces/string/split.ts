import { Types } from "..";

type SplitFirstInner<
  T extends string,
  SplitKeyword extends string,
  Before extends string = ""
> = T extends `${infer Keyword}${infer After}`
  ? Keyword extends SplitKeyword
    ? [Before, After]
    : SplitFirstInner<After, SplitKeyword, `${Before}${Keyword}`>
  : [Before];

/**
 * @beta
 */
export type SplitFirst<T extends string, SplitKeyword extends string> = SplitFirstInner<
  T,
  SplitKeyword
>;

type SplitInternal<
  T extends string,
  SplitKeyword extends string,
  Deep extends number,
  Result extends string[] = [],
  Splited extends [string, string?] = SplitFirst<T, SplitKeyword>
> = Splited extends [string, string]
  ? Deep extends 0
    ? [...Result, T]
    : SplitInternal<Splited[1], SplitKeyword, Types.Number.Minus<Deep>, [...Result, Splited[0]]>
  : Result;

/**
 * @beta
 */
export type Split<
  T extends string,
  SplitKeyword extends string,
  Deep extends number = 9
> = SplitInternal<T, SplitKeyword, Deep>;
