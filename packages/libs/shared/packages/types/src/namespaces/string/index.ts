import { Types } from "..";

/**
 * @beta
 */
export type Peaces<K extends string> = K extends `${infer Pre}${infer D}`
  ? [Pre, ...Peaces<D>]
  : [];

/**
 * @beta
 */
export type Length<K extends string, Deep extends number = 0> = K extends `${string}${infer D}`
  ? Length<D, Types.Number.Plus<Deep>>
  : Deep;

export * from "./case";
export * from "./split";

type test = Types.String.Split<"update:app-s2-s3-c4-as-a6-sa-s3-c4-as-a6-sa-s3-c4-as-a6-sa", "-">;

/**
 * @beta
 */
export type JoinWith<K, P, STR extends string = ""> = K extends string | number
  ? P extends string | number
    ? `${K}${"" extends P ? "" : STR}${P}`
    : never
  : never;
