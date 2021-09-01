import { Types } from "..";
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

export type Join<Keys extends string[], JoinStr extends string = ""> = JoinWith<Keys, JoinStr>;

type test = Types.Array.Join<Types.String.Peaces<"ABC?D,ADA.asSASasas">, "|">;

export * from "./Split";
export * from "./Length";
export * from "./util";
