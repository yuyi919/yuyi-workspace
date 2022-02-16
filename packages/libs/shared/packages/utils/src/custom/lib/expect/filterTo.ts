/* eslint-disable */
import { FilterGenerator } from "./filterTypes";

/**
 * 提供一个断言函数和若干个值，以此对这些值进行校验，并返回首个校验通过的值
 * @param expect - 断言函数
 * @param values - rest 需要校验的值
 * @returns 首个通过校验的值，如果全都未通过则返回`undefined`
 * @alpha
 */
export function expectTo<Target>(
  expect: (target: any) => target is Target,
  ...values: any[]
): Target | undefined;

/**
 * @alpha
 */
export function expectTo<Target>(expect: (target: any) => boolean): Target | void {
  var i = 0,
    length = arguments.length,
    v: any;
  while (++i < length)
    // eslint-disable-next-line
    if (expect((v = arguments[i]))) return v;
}

/**
 * @param expect - 断言函数
 * @returns 返回一个断言Filter函数
 * @alpha
 */
export function extendToFilter<T>(expect: (value: any) => value is T): FilterGenerator<T> {
  return function () {
    var i = -1,
      length = arguments.length,
      v: any;
    while (++i < length)
      // eslint-disable-next-line
      if (expect((v = arguments[i]))) return v;
  } as FilterGenerator<T>;
}
