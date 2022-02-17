/* eslint-disable one-var */
/* eslint-disable no-unused-expressions */
import {
  computed,
  defineComponent,
  isRef,
  nextTick,
  onBeforeUnmount,
  onUnmounted,
  reactive,
  Ref,
  ref,
  watch,
} from "vue-demi";
import { unwrap, useComponentEl, useNamedRef, WrapValue } from "@yuyi919/vue-use";
import { DomUtils, TypedPropsGroup } from "@antv-plus2/helper";
import { throttle } from "lodash";
import { useBarClasses } from "./classes";
import { getScrollMoveInstance } from "./main";
import { BAR_MAP, renderThumbStyle } from "./util";

interface Cancelable<T = any> {
  cancel(): void;
  flush(): T | void;
}
interface DivMouseEvent extends MouseEvent {
  target: HTMLDivElement;
  currentTarget: HTMLDivElement;
}

class BarStore {
  X!: number;
  Y!: number;
}

export function useNativeElementAddListener<T extends HTMLElement>(
  domRef: WrapValue<T>,
  eventName: string,
  handle: (e: any) => any
) {
  const disposer = watch(
    () => unwrap(domRef),
    (wrap, prev) => {
      // eslint-disable-next-line eqeqeq
      if (wrap != prev) {
        prev && DomUtils.off(prev, eventName, handle);
        wrap && DomUtils.on(wrap, eventName, handle);
      }
    },
    { immediate: true }
  );
  onBeforeUnmount(() => {
    const dom = unwrap(domRef);
    dom && DomUtils.off(dom, eventName, handle);
    disposer?.();
  });
}

/**
 * 创建一个节流函数，在 wait 秒内最多执行 func 一次的函数。
 * 该函数提供一个 cancel 方法取消延迟的函数调用以及 flush 方法立即调用。
 * 可以提供一个 options 对象决定如何调用 func 方法， options.leading 与|或 options.trailing 决定 wait 前后如何触发。
 * func 会传入最后一次传入的参数给这个函数，随后调用的函数返回是最后一次 func 调用的结果。
 * 注意: 如果 leading 和 trailing 都设定为 true 则 func 允许 trailing 方式调用的条件为: 在 wait 期间多次调用。
 * @param handle
 * @param wait 大于0的数值，单位为ms
 */
export function useThrottleHandle<T extends (...args: any[]) => any>(
  handle: T,
  wait: number | Ref<number> | (() => number)
): T & Cancelable<ReturnType<T>> {
  if (wait instanceof Function || isRef(wait)) {
    let innerMethod: T | (T & Cancelable);
    watch(
      wait,
      (throttleTime: number, prevThrottleTime) => {
        // console.log("use throttle", throttleTime, prevThrottleTime);
        if (!(typeof throttleTime === "number") || throttleTime === 0) {
          (innerMethod as Cancelable)?.flush?.();
          innerMethod = handle;
        } else if (throttleTime !== prevThrottleTime) {
          (innerMethod as Cancelable)?.flush?.();
          innerMethod = throttle(handle, throttleTime) as T & Cancelable;
        }
      },
      { immediate: true }
    );
    onUnmounted(() => (innerMethod as Cancelable)?.cancel?.());
    return Object.assign(
      function (this: any, ...args: any[]) {
        return innerMethod.apply(this, args);
      },
      {
        cancel() {
          (innerMethod as Cancelable)?.cancel?.();
        },
        flush() {
          return (innerMethod as Cancelable<ReturnType<T>>)?.flush?.();
        },
      }
    ) as T & Cancelable<ReturnType<T>>;
  }
  if (wait > 0) {
    console.log("use throttle static", wait);
    return throttle(handle, wait) as T & Cancelable<ReturnType<T>>;
  }
  throw new Error("等待时间必须大于0");
}

/**
 * 使用requestAnimationFrame延迟调用函数
 * @param handle
 */
export function useRaf<T extends (...args: any) => any>(handle: T): T & Cancelable<ReturnType<T>> {
  let isCancel = false,
    reqArgs: any[];
  function flush(this: any) {
    handle.apply(this, reqArgs);
    reqArgs = null!;
  }
  function caller(...args: any) {
    reqArgs = args;
    requestAnimationFrame(() => {
      if (isCancel) {
        isCancel = false;
      } else {
        flush();
      }
    });
  }
  caller.cancel = function () {
    isCancel = true;
  };
  caller.flush = flush;
  return caller as T & Cancelable<ReturnType<T>>;
}

/* istanbul ignore next */
export const Bar = defineComponent({
  name: "Bar",
  props: {
    vertical: Boolean,
    size: {
      type: Number,
      required: true,
    },
    move: Number,
    wrapRef: {
      type: null,
      required: true,
    },
    delay: {
      type: Number,
      default: 0,
    },
  } as unknown as TypedPropsGroup<{
    vertical?: boolean;
    move?: number;
    size: number;
    wrapRef: WrapValue<HTMLDivElement>;
    delay?: number;
  }>,
  emits: ["scroll"],
  setup(props, context) {
    const elRef = useComponentEl();
    const store = new BarStore();
    const classes = useBarClasses();
    /**
     * 正在拖拽滚动条
     */
    const dragging = ref<boolean>(false);
    const bar = BAR_MAP[props.vertical ? "vertical" : "horizontal"];
    const computeds = reactive({
      wrap: computed<HTMLDivElement>(() => unwrap(props.wrapRef) as HTMLDivElement),
    });
    const thumb = useNamedRef<HTMLDivElement>("thumbRef");

    function getThumbPositionPercentage(offset: number, thumbClickPosition: number) {
      return ((offset - thumbClickPosition) * 100) / elRef.value[bar.offset];
    }

    let prevScroll = 0;
    const methods = {
      updateThumbStyle: useThrottleHandle(
        (scroll: number = prevScroll) => {
          requestAnimationFrame(() => {
            const style = thumb.value?.style;
            style &&
              Object.assign(
                style,
                renderThumbStyle(
                  getScrollMoveInstance(computeds.wrap, bar, props.size, scroll),
                  props.size,
                  bar
                )
              );
          });
          prevScroll = scroll;
        },
        () => props.delay!
      ),
      updateWrapScroll: useThrottleHandle(
        (scroll: number) => {
          requestAnimationFrame(() => {
            computeds.wrap[bar.scroll] = scroll;
          });
        },
        () => props.delay!
      ),
      onScrollHandle(e: DivMouseEvent) {
        if (!dragging.value) {
          const scroll = computeds.wrap[bar.scroll];
          if (scroll !== prevScroll) {
            methods.updateThumbStyle(scroll);
            context.emit("scroll", e);
          }
        }
      },
      updateWrap(thumbPositionPercentage: number) {
        const scroll =
          props.move ||
          Math.min(
            (Math.max(thumbPositionPercentage, 0) * computeds.wrap[bar.scrollSize]) / 100,
            // 因为wrap元素有margin样式，采用clientSize而非offsetSize
            computeds.wrap[bar.scrollSize] - computeds.wrap[bar.clientSize]
          );
        methods.updateThumbStyle(scroll);
        methods.updateWrapScroll(scroll);
      },
      clickThumbHandler(e: MouseEvent) {
        e.stopImmediatePropagation();
        e.preventDefault();
        // prevent click event of right button
        if (e.ctrlKey || e.button === 2) {
          return;
        }
        methods.startDrag(e);
        store[bar.axis] =
          (e as DivMouseEvent).currentTarget[bar.offset] -
          (e[bar.client] -
            (e as DivMouseEvent).currentTarget.getBoundingClientRect()[bar.direction]);
      },

      clickTrackHandler(e: MouseEvent) {
        e.stopImmediatePropagation();
        e.preventDefault();
        const offset = Math.abs(
          (e as DivMouseEvent).target.getBoundingClientRect()[bar.direction] - e[bar.client]
        );
        const thumbHalf = thumb.value![bar.offset] / 2;
        methods.updateWrap(getThumbPositionPercentage(offset, thumbHalf));
      },

      startDrag(e: MouseEvent) {
        e.stopImmediatePropagation();
        dragging.value = true;
        DomUtils.on(document, "mousemove", methods.mouseMoveDocumentHandler);
        DomUtils.on(document, "mouseup", methods.mouseUpDocumentHandler);
        document.onselectstart = () => false;
      },
      mouseMoveDocumentHandler(e: DivMouseEvent) {
        if (dragging.value === false) return;
        const prevPage = store[bar.axis];
        if (!prevPage) return;
        const offset = (elRef.value.getBoundingClientRect()[bar.direction] - e[bar.client]) * -1;
        const thumbClickPosition = thumb.value![bar.offset] - prevPage;
        methods.updateWrap(getThumbPositionPercentage(offset, thumbClickPosition));
        document.body.style.cursor = "pointer";
      },
      mouseUpDocumentHandler(e: Event) {
        dragging.value = false;
        store[bar.axis] = 0;
        DomUtils.off(document, "mousemove", methods.mouseMoveDocumentHandler);
        document.onselectstart = null!;
        document.body.style.cursor = null!;
      },
    };
    // @ts-ignore
    elRef.updateThumbStyle = methods.updateThumbStyle;
    // @ts-ignore
    elRef.updateWrapScroll = methods.updateWrapScroll;
    // methods.mouseMoveDocumentHandler = throttle(methods.mouseMoveDocumentHandler, 20);
    // methods.updateWrapScroll = throttle(methods.updateWrapScroll, 10);
    // methods.updateThumbStyle = throttle(methods.updateThumbStyle, 10);

    watch(
      () => props.size,
      (size) => {
        size && nextTick(() => methods.updateThumbStyle());
      },
      { immediate: true }
    );
    props.wrapRef && useNativeElementAddListener(props.wrapRef, "scroll", methods.onScrollHandle);
    onBeforeUnmount(() => {
      DomUtils.off(document, "mouseup", methods.mouseUpDocumentHandler);
    });

    return () => {
      // console.log("[Debug][Bar] renderer bar", bar.axis, props.size);
      return (
        props.size > 0 && (
          <div
            class={[classes.root, classes[bar.key], dragging.value && classes.active]}
            onMousedown={methods.clickTrackHandler}
          >
            <div ref={thumb} class={[classes.thumb]} onMousedown={methods.clickThumbHandler} />
          </div>
        )
      );
    };
  },
});
