import { Types } from "..";
import { Minus } from "../number";
import { IsArray } from "./util";

type JoinWith<
  Keys extends string[],
  JoinStr extends string = "",
  Result extends string = ""
> = IsArray<Keys> extends false
  ? Result
  : JoinWith<
      Types.Array.RestOther<Keys>,
      JoinStr,
      Result extends "" ? Keys[0] : `${Result}${JoinStr}${Keys[0]}`
    >;

type ConcatWith<
  Keys extends [any, ...any[]],
  Result extends any[],
  Deep extends number = 4
> = Keys extends [infer T, ...infer K] | [...infer Other]
  ? Deep extends 0
    ? Result
    : Other extends K
    ? [...Result, ...K]
    : ConcatWith<[T, ...K], [...Result, ...Other], Minus<Deep>>
  : Result;

// type TK = Readonly<{ a: 1; b: 1 }> extends { [K in infer b]: 1 } ? [b: b] : [];
/**
 * @beta
 */
export type Join<Keys extends string[], JoinStr extends string = ""> = JoinWith<Keys, JoinStr>;

// type A = ConcatWith<[{ A: 1 }] | [{ B: 2 }], []>;

// type testU = Types.String.Peaces<"ABC?D,ADA.asSASasas">;
// type test = Types.Array.Join<testU, "|">;

export * from "./Split";
export * from "./Length";
export * from "./util";

// type OK = "a" | "bc" extends `${infer a}${infer b}` | `${infer c}` ? [a, b, c] : [];
