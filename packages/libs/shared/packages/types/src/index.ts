/**
 * TODO
 * @packageDocumentation
 */

// @ts-ignore
import { version as v } from "../package.json";

export * from "./namespaces";
export * from "./namespaces/shared";
export * from "./namespaces/loop";
export { Types as default } from "./namespaces";
export * from "./checker";

/**
 * 包版本
 * @public
 */
export const version = v;
