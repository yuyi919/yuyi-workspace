export * from "./namespaces";
export * from "./namespaces/shared";
export * from "./namespaces/loop";
export { Types as default } from "./namespaces";
export const Version = 2;
export * from "./checker";

import * as checker from "./checker";
import { ToUpperCaseFirst, ToLowerCaseFirst } from "./namespaces/string";
export type Checker = typeof checker;
type CheckerKey = Extract<keyof Checker, `is${string}`> extends `is${infer type}`
  ? type extends "NaN"
    ? "NaN"
    : ToLowerCaseFirst<type>
  : never;
type ComputedCheckerKey<K extends CheckerKey> = K extends `${infer A}${infer B}`
  ? `is${ToUpperCaseFirst<A>}${B}`
  : K;

export const is = {} as {
  [K in CheckerKey]: Checker[ComputedCheckerKey<K>];
};

for (const key in checker) {
  const type = key.replace(/^is/, "");
  type K = "num";
  is[(type === "NaN" ? type : type[0].toLowerCase() + type.slice(1)) as K] =
    checker[key as ComputedCheckerKey<K>];
}
