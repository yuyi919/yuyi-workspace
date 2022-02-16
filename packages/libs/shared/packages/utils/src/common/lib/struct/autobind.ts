import { cloneDeep, isPureObj } from "../atomic";
/**
 * @public
 */
/**
 * 自动绑定对象中的function的`this`
 * @param target - 对象
 * @param isCloneDeep - 是否返回深拷贝的对象(默认为true)
 * @typeParam T - 对象类型
 * @returns 返回绑定过的同类型对象
 * @example
 * 基本用法
 *```ts
 * const Logger = {
 *    core: console.log,
 *    log(message: string) {
 *      this.core(message);
 *    }
 * }
 * const { log } = autoBindObj(Logger)
 * log('hello world')
 *
 * //*print => 'hello world';
 *```
 * @example
 *```ts
 * class Logger {
 *    core = console.log;
 *    log(message: string) {
 *      this.core(message);
 *    }
 * }
 * const { log } = autoBindObj(new Logger());
 * log('hello world')
 *
 * //*error => this is undefined;
 *```
 * @remarks
 * 对于class的自动绑定，请使用{@link https://www.lodashjs.com/docs/latest#_groupbycollection-iteratee_identity| @autobind}
 * @public
 */
export function autoBindObj<T>(target: T, isCloneDeep = true) {
  isCloneDeep && (target = cloneDeep(target));
  if (isPureObj(target)) {
    Object.entries(target).forEach((entry) => {
      if (entry[1] instanceof Function) {
        target[entry[0]] = entry[1].bind(target);
      }
    });
  }
  return target;
}
