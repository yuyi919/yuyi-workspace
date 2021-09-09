/**
 * 逻辑工具函数
 * 接收一个值，如果是非Promise则自动包装为Promise
 * 如果传入值为Promise，可传入回调函数
 * 如果传入值为非Promise，可传入回调函数
 * @param target
 * @param when 传入时，监听原生```Promise```的resolving(立即执行)/resolved(then后执行)状态并调用此回调函数
 * @param or 在即将返回包装后的```Promise```之前调用
 */
export function withAsyncOr<T>(
  target: T | Promise<T>,
  when?: (resolving: boolean) => void,
  or?: () => void
): Promise<T> {
  if (target instanceof Promise) {
    return (
      (!when && target) ||
      (when && when(true),
      target.then((r) => {
        when && when(false);
        return r;
      }))
    );
  }
  or && or();
  return Promise.resolve(target);
}
