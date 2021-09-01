/* eslint-disable @typescript-eslint/no-empty-interface */
import * as Is from "./atomic";
type Base = typeof Is;
export interface TypeExpectors extends Base {}
export type TypeExpectorType = keyof TypeExpectors;

export const options: TypeExpectors = { ...Is } as TypeExpectors;

/**
 *
 * @param key
 * @param target
 */
export function call<K extends TypeExpectorType, T>(key: K, target: T): boolean {
  //@ts-ignore
  return options[key](target);
}
/**
 *
 * @param key
 * @param target
 */
export function configure<K extends TypeExpectorType>(key: K, target: TypeExpectors[K]): void {
  options[key] = target;
}
/**
 *
 * @param target
 */
configure.all = function (target: Partial<TypeExpectors>): void {
  Object.assign(options, target);
};

export { Is };
