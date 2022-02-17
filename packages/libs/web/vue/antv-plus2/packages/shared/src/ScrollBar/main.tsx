/* eslint-disable no-unused-expressions */
/* eslint-disable no-use-before-define */
/* eslint-disable prefer-const */
// reference https://github.com/noeldelgado/gemini-scrollbar/blob/master/index.js

import {
  computed,
  defineComponent,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  reactive,
  watch,
} from "vue-demi";
import { addResizeListener, removeResizeListener, useNamedRef } from "@yuyi919/vue-use";
import { CSSProperties } from "@yuyi919/shared-types";
import { castArray } from "@yuyi919/shared-utils";
import { DomUtils, extractProps } from "@antv-plus2/helper";
import { autoSizer } from "@antv-plus2/theme";
import { debounce, throttle } from "lodash";
import { VNode } from "vue";
import { Bar } from "./bar";
import { useClass, useClasses } from "./classes";
import { ScrollBarProps } from "./ScrollBarProps";
import { BarMapValue, BAR_MAP } from "./util";

/* istanbul ignore next */
export const Scrollbar = defineComponent({
  name: "Scrollbar",
  components: { Bar },
  mixins: [],
  props: extractProps(ScrollBarProps),
  emits: ["scroll"],
  setup(props: ScrollBarProps, context) {
    const self = getCurrentInstance()!.proxy;
    const wrapRef = useNamedRef<HTMLDivElement>("wrapRef");
    const viewRef = useNamedRef<HTMLDivElement>("viewRef");
    const logger = (...args: any[]) => {
      props.debug && console.debug(`[Debug] ${props.debug}`, ...args);
    };
    const containerState = reactive<{ width?: string | number; height?: string | number }>({
      width: void 0,
      height: void 0,
    });
    const { state, methods, mounted, beforeDestroy } = {
      state: reactive({
        width: 0,
        height: 0,
      }),
      methods: {
        handleScroll: (e: UIEvent) => {
          // console.log("handleScroll", e.target[BAR_MAP.vertical.scroll]);
          context.emit("scroll", e);
        },
        updataSizeWith(
          wrap: any,
          type: keyof typeof BAR_MAP,
          offsetSize: number = wrap[BAR_MAP[type].offset]
        ) {
          const map = BAR_MAP[type];
          // if (type === "vertical") {
          //   console.log(
          //     "updateContainer",
          //     type,
          //     wrap[map.offset],
          //     (self.$el as HTMLDivElement)[map.clientSize]
          //   );
          // }
          logger("update:" + type, offsetSize, "/", wrap[map.scrollSize]);
          const percentage = offsetSize / wrap[map.scrollSize];
          const barSize = offsetSize / 7;
          if (percentage < 1) {
            const size = Math.max(barSize, percentage * offsetSize - 4);
            if (state[map.size] !== size) state[map.size] = size;
            return size;
          } else if (state[map.size] !== 0) {
            state[map.size] = 0;
            return 0;
          }
        },
        // updateSize: () => {
        // const widthPercentage = wrap.offsetWidth / wrap.scrollWidth;
        // // console.log(self.$el.parentElement.clientHeight, wrap.offsetHeight, wrap.scrollHeight);
        // if (widthPercentage < 1) {
        //   const width = Math.max(30, widthPercentage * wrap.offsetWidth);
        //   if (state.width !== width) state.width = width;
        // } else if (state.width !== 0) {
        //   state.width = 0;
        // }
        // const heightPercentage = wrap.offsetHeight / wrap.scrollHeight;
        // if (heightPercentage < 1) {
        //   const height = Math.max(30, heightPercentage * wrap.offsetHeight);
        //   if (state.height !== height) state.height = height;
        // } else if (state.height !== 0) {
        //   state.height = 0;
        // }
        // console.log([state.sizeWidth, state.sizeHeight]);
        // },
        setContainer(type: "height" | "width", size: string | number) {
          if (containerState[type] !== size) {
            if (props.debug) {
              logger("update:State:" + type, autoSizer(size), autoSizer(containerState[type]));
            }
            containerState[type] = size;
            return true;
          }
          return false;
        },
        getContainerParentSize() {
          const el = self.$el as HTMLDivElement;
          // methods.setContainer("height", "100%");
          // methods.setContainer("width", "100%");
          return new Promise<[width: number, height: number]>((resolve) => {
            const parent = el.parentElement || el;
            requestAnimationFrame(() => {
              resolve([parent?.clientWidth || 0, parent?.clientHeight || 0]);
            });
          });
        },
        async getAutoSize() {
          // NOTE 取得最大尺寸设定，如果缺少任何一个就取父元素的尺寸
          let { maxHeight, maxWidth } = props;
          if (maxHeight === void 0 || maxWidth === void 0) {
            const [w, h] = await methods.getContainerParentSize();
            maxWidth = maxWidth === void 0 ? w : maxWidth;
            maxHeight = maxHeight === void 0 ? h : maxHeight;
            // console.log(w, h);
          }
          // +11是view的padding的宽度
          const contentHeight = viewRef.value!.offsetHeight;
          const contentWidth = viewRef.value!.offsetWidth;
          // console.log(contentHeight, maxHeight);
          return [
            maxWidth > 0 ? Math.min(maxWidth, contentWidth) : contentWidth,
            maxHeight > 0 ? Math.min(maxHeight, contentHeight) : contentHeight,
          ] as const;
        },
        updateBarSize: debounce(() => {
          if (wrapRef.value) {
            methods.updataSizeWith(wrapRef.value, "horizontal");
            methods.updataSizeWith(wrapRef.value, "vertical");
          }
        }, props.listenerDelay),
        updateContainer: debounce(async () => {
          let { width, height } = props;
          if (width === void 0 || height === void 0) {
            const [w, h] = await methods.getAutoSize();
            width = width === void 0 ? w : width;
            height = height === void 0 ? h : height;
          }
          const changedHeight = methods.setContainer("height", height!);
          requestAnimationFrame(() => {
            // methods.setContainer("width", width);
          });
          const wrap = wrapRef.value;
          if (!wrap) return;
          methods.updateBarSize();
          // if (changedWidth) {
          logger("update:containerSize", autoSizer(width), autoSizer(height));
          //   barRefH.value?.updateThumbStyle(wrapRef.value.scrollLeft);
          //   barRefH.value?.updateWrapScroll(wrapRef.value.scrollLeft);
          // }
          if (changedHeight) {
            barRefV.value?.updateThumbStyle(wrapRef.value!.scrollTop);
            barRefV.value?.updateWrapScroll(wrapRef.value!.scrollTop);
          }
        }, props.listenerDelay),
        binding(native: boolean, noResize: boolean) {
          if (!native) {
            !noResize &&
              (addResizeListener(
                [self.$el as HTMLDivElement, viewRef.value!],
                methods.updateBarSize,
                40
              ),
              addResizeListener(
                [self.$el.parentElement!, viewRef.value!],
                methods.updateContainer,
                40
              ));
            viewRef.value!.addEventListener("transitionend", methods.forceUpdate);
            // addResizeListener(self.$el as HTMLDivElement, methods.updateContainer, 20)
          } else {
            !noResize && addResizeListener(viewRef.value, methods.updateContainer, 40);
          }
        },
        unbinding(native: boolean, noResize: boolean) {
          if (!native) {
            !noResize &&
              (removeResizeListener(
                [self.$el as HTMLDivElement, viewRef.value!],
                methods.updateBarSize
              ),
              removeResizeListener(
                [self.$el.parentElement!, viewRef.value!],
                methods.updateContainer
              ));
            wrapRef.value = null;
          } else {
            !noResize && removeResizeListener(viewRef.value, methods.updateContainer);
          }
        },
        flush: () => {
          methods.updateBarSize.flush();
          methods.updateContainer.flush();
          // methods.updateBarSize();
          // methods.updateContainer();
        },
        forceUpdate: throttle(() => {
          methods.updateBarSize();
          methods.updateContainer();
          methods.updateBarSize.flush();
          methods.updateContainer.flush();
        }, 10),
      },
      mounted: () => {
        props.wrapRef?.(wrapRef.value);
        requestAnimationFrame(() => {
          methods.updateContainer();
          methods.updateBarSize();
        });
        methods.binding(props.native!, props.noResize!);
      },
      beforeDestroy: () => {
        props.wrapRef?.(null);
        methods.unbinding(props.native!, props.noResize!);
      },
    };
    watch(
      () => [props.native!, props.noResize!],
      ([native, noResize], prev) => {
        if (prev) methods.unbinding(prev[0], prev[1]);
        methods.binding(native!, noResize!);
      }
    );
    watch(
      () => [props.height, props.maxHeight],
      () => {
        methods.updateContainer();
      }
    );

    onMounted(mounted);
    onBeforeUnmount(beforeDestroy);
    const barRefH = useNamedRef<{
      updateThumbStyle(scroll: number): void;
      updateWrapScroll(scroll: number): void;
    }>("barRefH");
    const barRefV = useNamedRef<{
      updateThumbStyle(scroll: number): void;
      updateWrapScroll(scroll: number): void;
    }>("barRefV");
    const wrapStyleRef = computed(() => {
      let style = props.wrapStyle;
      if (props.native) {
        return style;
      }
      const gutter: number = DomUtils.scrollbarWidth();
      if (gutter) {
        const gutterWith = `-${gutter}px`;
        const gutterStyle: CSSProperties = {
          marginRight: state.height > 0 ? gutterWith : "0",
          // width: state.sizeHeight > 0 ? `calc(100% - ${gutter}px)` : "100%",
          marginBottom: state.width > 0 ? gutterWith : "0",
          // height: state.sizeWidth > 0 ? `calc(100% - ${gutter}px)` : "100%",
        };
        gutterStyle["overflowY"] = state.height === 0 ? "hidden" : "scroll";
        gutterStyle["overflowX"] = state.width === 0 ? "hidden" : "scroll";
        // console.log(gutterStyle);
        style = (style ? [...castArray(style), gutterStyle] : gutterStyle) as
          | CSSProperties
          | CSSProperties[];
      }
      return style;
    });

    const bars = computed(() => [
      <Bar ref={barRefH} delay={props.delay! * 2} wrapRef={wrapRef} size={state.width}></Bar>,
      <Bar
        vertical
        ref={barRefV}
        delay={props.delay! * 2}
        wrapRef={wrapRef}
        size={state.height}
        onScroll={(e: any) => {
          // console.log("handleScroll", e);
        }}
      ></Bar>,
    ]);

    const classes = useClasses(useClass(props));

    const classNames = computed(() => ({
      rootCls: classes.root,
      viewCls: [classes.view, props.viewClass],
      wrapCls: [
        props.wrapClass,
        classes.wrap,
        state.height > 0 && classes.vertical,
        state.width > 0 && classes.horizontal,
        props.noPadding && classes.wrapNoPadding,
        props.hidden === true || (!props.native && !DomUtils.scrollbarWidth())
          ? classes.wrapHidden
          : "",
        props.native && classes.native,
      ],
    }));
    watch(
      () => props.disabled,
      () => {
        containerState.height = void 0;
        containerState.width = void 0;
        methods.updateBarSize();
      }
    );
    return () => {
      const style = wrapStyleRef.value;
      const View = props.tag!;
      const { rootCls, viewCls, wrapCls } = classNames.value;
      const children = context.slots.default?.();
      const view = (
        <View class={viewCls} style={props.viewStyle} ref={viewRef}>
          {children}
        </View>
      );
      let nodes: VNode | (VNode | VNode[])[];
      if (!props.native) {
        nodes = [
          <div ref={wrapRef} class={wrapCls} style={style} onScroll={methods.handleScroll}>
            {view}
          </div>,
          bars.value,
        ];
      } else {
        nodes = (
          <div
            ref={wrapRef}
            class={wrapCls}
            style={[style, { overflow: "auto", height: "100%" }]}
            onScroll={methods.handleScroll}
          >
            {view}
          </div>
        );
      }
      return (
        <div
          class={rootCls}
          style={{
            width: autoSizer(containerState.width),
            height: autoSizer(containerState.height),
          }}
          on={{
            mousemove: methods.flush,
          }}
          data-delay={props.delay}
        >
          {nodes}
        </div>
      );
    };
  },
});

export function getScrollMoveInstance(
  wrap: HTMLDivElement,
  barMap: BarMapValue,
  size: number,
  scroll: number
): number {
  const clientSize = wrap[barMap.clientSize] - 2;
  const scrollSize = wrap[barMap.scrollSize];
  // const mixedScroll = (scroll * (scrollSize - size)) / scrollSize;
  // console.log(scrollSize, clienetSize, scroll, size);
  const max = clientSize - size;
  const scrollMax = scrollSize - clientSize;
  return Math.min(Math.max((scroll / scrollMax) * max, 0), max);
}
