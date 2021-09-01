import { Types } from "..";

export type Peaces<K extends string> = K extends `${infer Pre}${infer D}`
  ? [Pre, ...Peaces<D>]
  : [];

export type Length<K extends string, Deep extends number = 0> = K extends `${string}${infer D}`
  ? Length<D, Types.Number.Plus<Deep>>
  : Deep;

// type test = Split<"update:app-s2-s3-c4-as-a6-sa-s3-c4-as-a6-sa-s3-c4-as-a6-sa", ":" | "-">;
export * from "./case";
export * from "./split";
