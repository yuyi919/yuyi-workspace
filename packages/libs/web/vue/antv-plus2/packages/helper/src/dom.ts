const isServer = typeof window === "undefined";
/* istanbul ignore next */
export const on: {
  (element: HTMLElement | Document, event: string, handler: EventListener): void;
  (element: HTMLElement | Document, event: string, handler: (e: any) => void): void;
} = (() => {
  if (!isServer && document.addEventListener) {
    return function (element: HTMLElement | Document, event: string, handler: EventListener) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false);
      }
    };
  } else {
    return function (element: HTMLElement | Document, event: string, handler: EventListener) {
      if (element && event && handler) {
        (element as any).attachEvent("on" + event, handler);
      }
    };
  }
})();

/* istanbul ignore next */
export const off: {
  (element: HTMLElement | Document, event: string, handler: EventListener): void;
  (element: HTMLElement | Document, event: string, handler: (e: any) => void): void;
} = (() => {
  if (!isServer && document.removeEventListener) {
    return function (element: HTMLElement | Document, event: string, handler: EventListener) {
      if (element && event) {
        element.removeEventListener(event, handler, false);
      }
    };
  } else {
    return function (element: HTMLElement | Document, event: string, handler: EventListener) {
      if (element && event) {
        (element as any).detachEvent("on" + event, handler);
      }
    };
  }
})();

export function once(el: HTMLElement | Document, event: string, fn: EventListener): void;
export function once(el: HTMLElement | Document, event: string, fn: (e: any) => void): void;
/* istanbul ignore next */
export function once(el: HTMLElement | Document, event: string, fn: EventListener) {
  function listener(this: any, e: Event) {
    if (fn) {
      fn.call(this, e);
    }
    off(el, event, listener);
  }
  on(el, event, listener);
}

let _scrollBarWidth!: number;
export function scrollbarWidth() {
  if (isServer) return 0;
  if (_scrollBarWidth !== undefined) return _scrollBarWidth;

  const outer = document.createElement("div");
  outer.className = "el-scrollbar__wrap";
  outer.style.visibility = "hidden";
  outer.style.width = "100px";
  outer.style.position = "absolute";
  outer.style.top = "-9999px";
  document.body.appendChild(outer);

  const widthNoScroll = outer.offsetWidth;
  outer.style.overflow = "scroll";

  const inner = document.createElement("div");
  inner.style.width = "100%";
  outer.appendChild(inner);

  const widthWithScroll = inner.offsetWidth;
  outer.parentNode!.removeChild(outer);
  _scrollBarWidth = widthNoScroll - widthWithScroll;

  return _scrollBarWidth;
}
