import { castArray } from "lodash";

// function defaultCastToArray(key: string) {
//   return key;
// }
export type IObject2Array<T> = (target: any, targetKey?: string, arr?: T[]) => T | T[];

/**
 * 常用组装props
 * 将数组/对象递归地展开成为配置性的数组
 * 如果传入为字符串，自动转换为[字符串]后返回
 * @param obj
 * @param obj2Array 处理对象的函数，返回单个值或一组值（会展开为平级到目标数组）
 * @param deepLimit 深度限制，0表示无限制
 * @remarks
 * 默认对象处理函数为：
 * ```ts
 * type IObject2Array<T> = (key: string, value?: any, arr?: T[]) => T[]
 * ```
 * - 字符串返回自己
 * - 对象返回key值(value值不为null/false/undefined/0的情况)
 *
 * @example
 * ```ts
 * convertArrayProps(12)
 * // [12]
 * convertArrayProps("12")
 * // ["12"]
 * convertArrayProps([{ abc: "123" }, "12"])
 * // ["abc", "12"]
 * convertArrayProps([{ abc: false }, "12"])
 * // ["12"]
 * convertArrayProps([{ abc: "123" }, "12"], (k, v) => k && v ? ({ action: k, title: v }) : k)
 * // [{ "action":"abc", "title":"123" }, "12"]
 * ```
 */
export function convertArrayProps<T, Target>(
  obj: Object | T | T[],
  obj2Array?: IObject2Array<Target>,
  deepLimit = 0
): Target[] {
  const input = [obj];
  const r: Target[] = [];
  const nextLevelSize: number[] = [];
  let currentIndex = 0;
  while (input.length > 0) {
    if (nextLevelSize.length > 0 && currentIndex === nextLevelSize[0]) {
      nextLevelSize.shift();
    }
    // debugger
    const allowContinue = deepLimit === 0 || nextLevelSize.length < deepLimit;
    const target = input.shift();
    const targetType = typeof target;
    const next: T[] = [];
    if (targetType === "string" || targetType === "number") {
      r.push(...castArray(obj2Array ? obj2Array(target) : (target as any)));
    } else if (target instanceof Object) {
      if (!allowContinue) {
        r.push(
          ...((obj2Array ? castArray(obj2Array(target)) : defaultObject2Array(target)) as Target[])
        );
      } else if (target instanceof Array) {
        nextLevelSize.push(target.length);
        next.push(...target);
        currentIndex = 0;
        input.unshift(...next);
        continue;
      } else {
        r.push(...defaultObject2Array(target, obj2Array));
      }
    }
    currentIndex++;
  }
  return r;
}
// @ts-ignore
// window.convertArrayProps = convertArrayProps
function defaultObject2Array<T>(obj: Record<string, any>, obj2Array?: IObject2Array<T>): T[] {
  return Object.keys(obj).reduce((arr: any[], key) => {
    if (obj2Array) {
      // key的value值为true则返回这个key, !value则为返回false
      const r =
        obj[key] === true ? obj2Array(key) : (obj[key] && obj2Array(obj[key], key, arr)) || false;
      if (r !== false) {
        arr.push(...castArray(r));
      }
    } else if (obj[key]) {
      arr.push(key);
    }
    return arr;
  }, []);
}

// (window as any).convertArrayProps = convertArrayProps

/**
 * 预处理配置参数，target===true的场合返回第二个参数，否则返回target经由convertArrayProps转换的结果
 * @param target
 * @param defaultValue
 * @remarks
 * 参照convertArrayProps
 */
export function trueOrArrayProps<T, Input = any>(
  target: T[] | boolean | Object,
  defaultValue: any
): any {
  return target === true
    ? defaultValue
    : target instanceof Object
    ? convertArrayProps<T, Input>(target)
    : [];
}
