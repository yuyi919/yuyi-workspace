/* eslint-disable @typescript-eslint/no-empty-interface */
import { is as Is } from "@yuyi919/shared-types";
type Base = typeof Is;
/**
 *
 * @alpha
 */
export interface TypeExpectors extends Base {}
/**
 *
 * @alpha
 */
export type TypeExpectorType = keyof TypeExpectors;

/**
 *
 * @internal
 */
export const options: TypeExpectors = /* @__PURE__ */ (() => ({ ...Is }))() as TypeExpectors;

/**
 *
 * @param key -
 * @param target -
 * @alpha
 */
export function call<K extends TypeExpectorType, T>(key: K, target: T): boolean {
  //@ts-ignore
  return options[key](target);
}

/**
 *
 * @param target -
 * @alpha
 */
export function configure(target: Partial<TypeExpectors>): void;
/**
 *
 * @param key -
 * @param target -
 * @alpha
 */
export function configure<K extends TypeExpectorType>(key: K, target: TypeExpectors[K]): void;
export function configure(target: any, key?: any): void {
  if (key) {
    options[target] = key;
  } else {
    Object.assign(options, target);
  }
}
