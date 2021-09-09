/* eslint-disable no-unused-expressions */
import { throttle } from "lodash";
import ResizeObserver from "resize-observer-polyfill";

/* istanbul ignore next */
const resizeHandler = function (entries: any) {
  for (const entry of entries) {
    const listeners = entry.target.__resizeListeners__ || [];
    if (listeners.length) {
      listeners.forEach((fn: () => any) => {
        fn();
      });
    }
  }
};
const isServer = typeof window === "undefined";

const cacheMap = new WeakMap<() => any, () => any>();

if (!isServer) {
  // @ts-ignore
  window.__addResizeListenerCacheMap = cacheMap;
}

/* istanbul ignore next */
export function addResizeListener<E extends HTMLElement>(
  element: undefined | null | E | E[],
  fn: () => any,
  wait?: number
): void {
  if (isServer) return;
  if (element instanceof Array) return element.forEach((e) => addResizeListener(e, fn, wait));
  if (!(element as any).__resizeListeners__) {
    (element as any).__resizeListeners__ = [];
    (element as any).__ro__ = new ResizeObserver(resizeHandler);
    (element as any).__ro__.observe(element);
  }
  if (fn && wait > 0) {
    const next = throttle(fn, wait);
    cacheMap.set(fn, next);
    fn = next;
  }
  (element as any).__resizeListeners__.push(fn);
}

/* istanbul ignore next */
export function removeResizeListener<E extends HTMLElement>(element: undefined | null | E | E[], fn: () => any): void {
  if (isServer) return;
  if (element instanceof Array) return element.forEach((e) => removeResizeListener(e, fn));
  if (!(element as any) || !(element as any).__resizeListeners__) return;
  fn = cacheMap.get(fn) || fn;
  (element as any).__resizeListeners__.splice((element as any).__resizeListeners__.indexOf(fn), 1);
  if (!(element as any).__resizeListeners__.length) {
    (element as any).__ro__.disconnect();
  }
}
