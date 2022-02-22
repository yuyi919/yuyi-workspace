const define = Object.freeze as <T>(v: T) => T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EmptyObject = define({} as Record<string, any>);
export const EmptyArray = define([]);
import * as Constant$ from "./lib";
export { Constant$ };
