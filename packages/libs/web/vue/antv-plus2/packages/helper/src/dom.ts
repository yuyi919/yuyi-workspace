const isServer = typeof window === "undefined";
/* istanbul ignore next */
export const on: {
  (element: HTMLElement | Document, event: string, handler: EventListener, options?: boolean | AddEventListenerOptions): void;
  (element: HTMLElement | Document, event: string, handler: (e: any) => void, options?: boolean | AddEventListenerOptions): void;
} = (() => {
  if (!isServer && document.addEventListener) {
    return function (element: HTMLElement | Document, event: string, handler: EventListener, options?: boolean | AddEventListenerOptions) {
      if (element && event && handler) {
        element.addEventListener(event, handler, options ?? false);
      }
    };
  } else {
    return function (element: HTMLElement | Document, event: string, handler: EventListener, options?: boolean | AddEventListenerOptions) {
      if (element && event && handler) {
        (element as any).attachEvent("on" + event, handler, options);
      }
    };
  }
})();

/* istanbul ignore next */
export const off: {
  (element: HTMLElement | Document, event: string, handler: EventListener, options?: boolean | AddEventListenerOptions): void;
  (element: HTMLElement | Document, event: string, handler: (e: any) => void, options?: boolean | AddEventListenerOptions): void;
} = (() => {
  if (!isServer && document.removeEventListener) {
    return function (element: HTMLElement | Document, event: string, handler: EventListener, options?: boolean | AddEventListenerOptions) {
      if (element && event) {
        element.removeEventListener(event, handler, options ?? false);
      }
    };
  } else {
    return function (element: HTMLElement | Document, event: string, handler: EventListener, options?: boolean | AddEventListenerOptions) {
      if (element && event) {
        (element as any).detachEvent("on" + event, handler, options);
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

let cached: number;
export function getScrollBarSize(fresh?: boolean) {
  if (fresh || cached === undefined) {
    const inner = document.createElement("div");
    inner.style.width = "100%";
    inner.style.height = "200px";

    const outer = document.createElement("div");
    const outerStyle = outer.style;

    outerStyle.position = "absolute";
    outerStyle.top = 0 as unknown as string;
    outerStyle.left = 0 as unknown as string;
    outerStyle.pointerEvents = "none";
    outerStyle.visibility = "hidden";
    outerStyle.width = "200px";
    outerStyle.height = "150px";
    outerStyle.overflow = "hidden";

    outer.appendChild(inner);

    document.body.appendChild(outer);

    const widthContained = inner.offsetWidth;
    outer.style.overflow = "scroll";
    let widthScroll = inner.offsetWidth;

    if (widthContained === widthScroll) {
      widthScroll = outer.clientWidth;
    }

    document.body.removeChild(outer);

    cached = widthContained - widthScroll;
  }
  return cached;
}

export function switchScrollingEffect(close?: boolean) {
  const bodyIsOverflowing =
    document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight) &&
    window.innerWidth > document.body.offsetWidth;
  if (!bodyIsOverflowing) {
    return;
  }
  if (close) {
    document.body.style.position = "";
    document.body.style.width = "";
    return;
  }
  const scrollBarSize = getScrollBarSize();
  if (scrollBarSize) {
    document.body.style.position = "relative";
    document.body.style.width = `calc(100% - ${scrollBarSize}px)`;
  }
}
export function contains(root: Node | null | undefined, n?: Node) {
  if (!root) {
    return false;
  }

  return root.contains(n);
}
