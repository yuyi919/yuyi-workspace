import { BaseType, Types, KeyOf } from "@yuyi919/shared-types";
import { Constant$ } from "@yuyi919/shared-constant";
import { castArray as castArrayLodash, cloneDeep, toString } from "lodash";
import { isFunction, isNotEmptyValue, isNotNil, isObject } from "../atomic";
import { stubReturn } from "./stub";

/**
 * 将一个非数组值转换为数组
 * @param value - 输入值
 * @param allowEmpty - 是否允许数组成员为nil（默认为true），false时会过滤掉null或undefined
 * @returns 由输入值转化而来的数组
 * @example
 * * 允许为nil时
 *```ts
 * castArray(null)
 * // => [null]
 *
 * castArray([undefined, null])
 * // => [undefined, null]
 *```
 * @remarks 注意，如果不允许空值（allowEmpty为false），即便输入值本身为数组也会进行过滤
 * @example
 *```ts
 * * 不允许为nil时
 * castArray(null, false)
 * // => []
 *
 * castArray([undefined, null], false)
 * // => []
 *```
 * @alpha
 */
export function castArray<T = any>(value: T | T[], allowEmpty: boolean | "strict" = true): T[] {
  return allowEmpty === true
    ? castArrayLodash(value)
    : Constant$.FILTER(
        castArrayLodash(value),
        allowEmpty === Constant$.KEY_STRICT ? isNotEmptyValue : isNotNil
      );
}

/**
 * 转化一个对象为object
 * 如果对象不是object，则返回一个嵌入指定key的新对象
 * 可选第三个参数，判断条件变更为是否存在指定key的对象
 * @param target -
 * @param keyInObject - 嵌入的key
 * @param checkRequired - 判定时key是否必须存在
 * @example
 *```ts
 * const t = { a: 1, b: 2 }
 * castObject(t, 'c')
 * //=> { a: 1, b: 2 }
 *```
 * @example
 * checkRequired的场合
 *```ts
 * castObject(t, 'c', true)
 * //=> { c: { a: 1, b: 2 } }
 *```
 * @beta
 */
export function castObject<T, K extends KeyOf<T> | string>(
  target: T | BaseType,
  keyInObject: K,
  checkRequired = false
): Exclude<T, BaseType> & {
  [Key in K]: T extends object ? (K extends KeyOf<T> ? T[K] : unknown) : unknown;
} {
  return isObject(target) && (!checkRequired || keyInObject in target)
    ? target
    : ({ [keyInObject]: target } as any);
}
// const t = { a: 1, b: 2 };
// castObject(t, 'c')

/**
 * 工具函数，执行一个computed计算函数
 * @param target - 计算用函数，或非函数的值
 * @param args - 计算用参数
 * @returns 如果target为函数，返回
 *```ts
 * computedFunc(...computedArgs) -> T // 计算结果
 *```
 * 否则原值返回
 * @example
 * 基本使用
 *```ts
 * castComputed((a, b, c) => a + b + c, 1, 2, 3);
 * // => 6
 *```
 * @example
 * 空参数
 *```ts
 * castComputed(a => a);
 * // => undefined
 *```
 * @example
 * 原值返回
 *```ts
 * castComputed(1, 2, 3);
 * // => 1
 *```
 * @beta
 */
export function castComputed<T extends any>(
  target: T,
  ...args: Types.Function.ExtractArgs<T, any[]>
): Types.Function.ReturnType<T, T> {
  return isFunction(target) ? (target as Types.Function.Base<any>)(...args) : target;
}

// castComputed((a, b, c) => a + b + c, 1, 2, 3);
// castComputed(1, 2, 3)\

/**
 * 计算用管道函数，如果非函数则传递值自身
 * @param func -
 * @param value -
 * @beta
 */
export function castComputedPipe<V, T = V>(func: Types.Function.Base<[V], T> | T, value: V): T {
  return func instanceof Function ? (func as Types.Function.Base<[V]>)(value) : value;
}

/**
 * 将参数转换为function
 * @param withFunction - 参数
 * @param raw - `default: false`是否返回深拷贝的值而非引用值（通常为对象）
 * @returns
 * 参数类型为`function`时直接返回参数<P/>
 * 其他情况返回一个`function`，这个`function`会返回你的参数
 * @remarks `raw`为`true`时，返回的对象会进行深拷贝（完全解除和原对象的引用）
 * @beta
 */
export function castFunction<T = any>(
  withFunction?: T,
  raw = false
): Types.Function.Base<any[], T> {
  raw && (withFunction = cloneDeep(withFunction));
  return isFunction(withFunction) ? withFunction : (stubReturn.bind(null, withFunction) as any);
}

/**
 * 转换为字符串
 * @param target -
 * @returns 字符串
 * @beta
 */
export function castString(target: any): string {
  return typeof target === "string" ? target : toString(target);
}

// /**
//  *
//  * @param objOrArr
//  * @param allowEmpty
//  */
// export function castObjectArray(objOrArr: any[], allowEmpty = true): any[] {
//   return Constant$.IS_ARR(
//     objOrArr
//   ) ? objOrArr : (
//       (allowEmpty ? isObject(objOrArr) : Constant$.OBJ_KEYS(objOrArr).length) && [objOrArr] || []
//     )
// }

// const oc = typeFilterUtils.isArrayFilter

// const test = oc([] instanceof Function ? [] : 1242, [], Math.min(10, 3), 21)
// const test2 = oc([] instanceof Function ? [] : 12424)
