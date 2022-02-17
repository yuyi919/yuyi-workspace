import { CSSProperties } from "@yuyi919/shared-types";
import {
  DomUtils,
  getSlot,
  getTransitionProps,
  KeyCode,
  noop,
  Transition,
  TsxTypeInfoHook,
} from "@antv-plus2/helper";
import { createContext } from "@yuyi919/vue-use";
// @ts-ignore
import { getOptionProps } from "ant-design-vue/es/_util/props-util";
import {
  computed,
  getCurrentInstance,
  nextTick,
  onUpdated,
  reactive,
  Ref,
  ref,
  toRefs,
  ToRefs,
  watch,
} from "vue-demi";
import { Mask } from "./components/Mask";
import { DialogProps } from "./DialogProps";
import { LazyRenderBox } from "./LazyRenderBox";
import { usePortalWrapper } from "./useCountWrapper";

const DialogContext = createContext<any>("dialogContext");

const findDOMNode = (instance: any): HTMLElement => {
  let node = instance?.$vnode?.elm || (instance && (instance.$el || instance));
  while (node && !node.tagName) {
    node = node.nextSibling;
  }
  return node;
};
export function useBaseMixins<Props extends {}, State extends {}>(
  options: any = {},
  props?: Props,
  opt?: {
    scopedSlots?: any;
    on?: any;
  }
) {
  const self = getCurrentInstance();
  function emit(eventName: string, ...args: any[]): void;
  function emit(e: string) {
    const { attrs: $attrs, props: $props = props } = self!;
    // 直接调用事件，底层组件不需要vueTool记录events
    const args = [].slice.call(arguments, 0);
    const eventName = `on${e[0].toUpperCase()}${e.substring(1)}`;
    const event: any = opt?.on?.[e] || (props || $props)![eventName] || $attrs[eventName];
    if (args.length && event) {
      if (Array.isArray(event)) {
        for (let i = 0, l = event.length; i < l; i++) {
          event[i](...args.slice(1));
        }
      } else {
        event(...args.slice(1));
      }
    }
  }
  return {
    attrs() {
      return self!.proxy!.$attrs as any;
    },
    getSlot(name?: string, data?: any) {
      const target = opt?.scopedSlots && opt;
      return getSlot(target || self!.proxy!, name, data);
    },
    // getOptionProps(): Props {
    //   return (props || self!.proxy.$props || {}) as Props;
    // },
    setState(state: State = {} as State, callback: any) {
      const { $data, $props } = self!.proxy;
      let newState = typeof state === "function" ? state($data, $props) : state;
      if (options.getDerivedStateFromProps) {
        const s = options.getDerivedStateFromProps(getOptionProps(self!.proxy), {
          ...$data,
          ...newState,
        });
        if (s === null) {
          return;
        } else {
          newState = { ...newState, ...(s || {}) };
        }
      }
      Object.assign($data, newState);
      if (self!.isMounted) {
        self!.proxy.$forceUpdate();
      }
      nextTick(() => {
        callback && callback();
      });
    },
    __emit: emit,
  };
}
// console.log(extractProps(DialogProps));

function getScroll(w: { [x: string]: any; document: any }, top?: boolean) {
  let ret = w[`page${top ? "Y" : "X"}Offset`];
  const method = `scroll${top ? "Top" : "Left"}`;
  if (typeof ret !== "number") {
    const d = w.document;
    ret = d.documentElement[method];
    if (typeof ret !== "number") {
      ret = d.body[method];
    }
  }
  return ret;
}

function setTransformOrigin(node: { style: any }, value: string) {
  const style = node.style;
  ["Webkit", "Moz", "Ms", "ms"].forEach((prefix) => {
    style[`${prefix}TransformOrigin`] = value;
  });
  style[`transformOrigin`] = value;
}

function offset(el: Element) {
  const rect = el.getBoundingClientRect();
  const pos = {
    left: Math.max(rect.left, 0),
    top: Math.max(rect.top, 0),
  };
  const doc = el.ownerDocument;
  const w = doc.defaultView || (doc as any).parentWindow;
  pos.left += getScroll(w);
  pos.top += getScroll(w, true);
  return pos;
}
const { contains } = DomUtils;

function extendProps<T extends {}>(props: ToRefs<T>, inheritProps: T, overwrite?: any) {
  const result = { ...props };
  for (const key of Object.keys({ ...inheritProps, ...overwrite })) {
    // @ts-ignore
    result[key] = computed(() => overwrite?.[key] ?? props[key]?.value ?? inheritProps[key]);
  }
  return reactive(result) as T;
}

let uuid = 0;

type DialogOptions = Partial<TsxTypeInfoHook<DialogProps, { close?: MouseEvent }>>;
export function useDialogHooks(_props: DialogProps, options?: DialogOptions) {
  const propRefs = toRefs(_props);
  const [portalProps, portal] = usePortalWrapper(
    reactive({
      wrapClassName: propRefs.wrapClassName,
      getContainer: computed(() => _props.getContainer || (() => document.body)),
      forceRender: propRefs.forceRender!,
      visible: propRefs.visible!,
    })
  );
  const props = extendProps(
    propRefs,
    {
      mask: true,
      visible: false,
      keyboard: true,
      closable: true,
      maskClosable: true,
      destroyOnClose: false,
      prefixCls: "rc-dialog",
      focusTriggerAfterClose: true,
      getOpenCount: () => null,
    },
    portalProps
  );
  const dialog = useDialog(props, options);
  return {
    ...dialog,
    linkWatch() {
      portal.linkWatch();
      onUpdated(() => {
        portal.updated();
      });
    },
    render() {
      return portal.render(() => dialog.render());
    },
  };
}
export function useDialog(props: DialogProps, options?: DialogOptions) {
  // console.log(props);
  // const props = reactive({
  //   mask: true,
  //   visible: false,
  //   keyboard: true,
  //   closable: true,
  //   maskClosable: true,
  //   destroyOnClose: false,
  //   prefixCls: "rc-dialog",
  //   focusTriggerAfterClose: true,
  //   ...inheritProps,
  // }) as DialogProps;

  const core = useBaseMixins({}, props, options);
  const temp = {} as {
    openTime: number;
    lastOutSideFocusNode?: HTMLDivElement | null;
    timeoutId: number;
  };

  const state = reactive({
    inTransition: false,
    titleId: `rcDialogTitle${uuid++}`,
  }) as unknown as {
    inTransition: boolean;
    titleId: string;
  };

  const refs = {
    header: ref<any>(null) as Ref<any>,
    footer: ref<any>(null) as Ref<any>,
    body: ref<any>(null) as Ref<any>,
    wrap: ref<any>(null) as Ref<any>,
    sentinelStart: ref<any>(null) as Ref<any>,
    sentinelEnd: ref<any>(null) as Ref<any>,
    dialog: ref<Vue>(null as any),
  };
  const $refs = reactive({ ...refs });
  const computedFunc = {
    getZIndexStyle() {
      const style = {} as CSSProperties;
      // const props = core.getOptionProps();
      if (props.zIndex !== void 0) {
        style.zIndex = props.zIndex;
      }
      return style;
    },
    getWrapStyle() {
      return { ...computedFunc.getZIndexStyle(), ...props.wrapStyle };
    },
    getMaskStyle() {
      return { ...computedFunc.getZIndexStyle(), ...props.maskStyle };
    },
  };
  const wrapStyle = computed(computedFunc.getWrapStyle);
  const maskStyle = computed(computedFunc.getMaskStyle);
  function useMaskWrapper() {
    const state = {
      dialogMouseDown: void 0 as unknown as boolean,
    };
    // const temp = {} as {
    //   timeoutId: number;
    // };
    const handle = {
      onDialogMouseDown() {
        state.dialogMouseDown = true;
      },

      onMaskMouseUp() {
        if (state.dialogMouseDown) {
          temp.timeoutId = setTimeout(() => {
            state.dialogMouseDown = false;
          }, 0) as unknown as number;
        }
      },

      onMaskClick(e: MouseEvent) {
        // android trigger click on open (fastclick??)
        if (Date.now() - temp.openTime < 300) {
          return;
        }
        if (e.target === e.currentTarget && !state.dialogMouseDown) {
          methods.close(e);
        }
      },

      dispose() {
        clearTimeout(temp.timeoutId);
      },
    };
    return [state, handle] as const;
  }
  const [, maskHandle] = useMaskWrapper();
  const maskEventHandle = {
    ...maskHandle,
    onMaskClick(e: MouseEvent) {
      // android trigger click on open (fastclick??)
      if (Date.now() - temp.openTime < 300) {
        return;
      }
      maskHandle.onMaskClick(e);
    },
  };
  const methods = {
    // 对外暴露的 api 不要更改名称或删除
    getDialogWrap() {
      return $refs.wrap;
    },
    updatedCallback(prevVisible?: boolean, target?: Element) {
      const mousePosition = props.mousePosition!;
      const { mask, focusTriggerAfterClose } = props;
      if (props.visible) {
        // first show
        if (!prevVisible) {
          // console.log("updatedCallback", props.visible, visible);
          // temp.lastOutSideFocusNode = document.activeElement
          methods.switchScrollingEffect();
          // $refs.wrap.focus()
          methods.tryFocus();
          const dialogNode = target || findDOMNode($refs.dialog);
          if (mousePosition && "style" in dialogNode) {
            const elOffset = offset(dialogNode);
            ($refs.wrap as HTMLElement).scrollTop = 0;
            // console.log(mousePosition, elOffset);
            setTransformOrigin(
              dialogNode as HTMLElement,
              `${mousePosition.x! - elOffset.left}px ${mousePosition.y! - elOffset.top}px`
            );
          } else {
            setTransformOrigin(dialogNode as HTMLElement, "");
          }
        }
      } else if (prevVisible) {
        // console.log("updatedCallback", props.visible, visible);
        state.inTransition = true;
        if (mask && temp.lastOutSideFocusNode && focusTriggerAfterClose) {
          try {
            temp.lastOutSideFocusNode.focus();
          } catch (e) {
            temp.lastOutSideFocusNode = null;
          }
          temp.lastOutSideFocusNode = null;
        }
      }
    },
    tryFocus() {
      if (!contains($refs.wrap, document.activeElement!)) {
        temp.lastOutSideFocusNode = document.activeElement as HTMLDivElement;
        $refs.sentinelStart.focus();
      }
    },
    onAnimateLeave() {
      const { afterClose } = props;
      if (afterClose) {
        afterClose();
      }
      // need demo?
      // https://github.com/react-component/dialog/pull/28
      if ($refs.wrap) {
        $refs.wrap.style.display = "none";
      }
      state.inTransition = false;
      methods.switchScrollingEffect();
    },
    onKeydown(e: KeyboardEvent) {
      // const props = core.getOptionProps();
      if (props.keyboard && e.keyCode === KeyCode.ESC) {
        e.stopPropagation();
        methods.close(e);
        return;
      }
      // keep focus inside dialog
      if (props.visible) {
        if (e.keyCode === KeyCode.TAB) {
          const activeElement = document.activeElement;
          const sentinelStart = $refs.sentinelStart;
          if (e.shiftKey) {
            if (activeElement === sentinelStart) {
              $refs.sentinelEnd.focus();
            }
          } else if (activeElement === $refs.sentinelEnd) {
            sentinelStart.focus();
          }
        }
      }
    },
    getDialogElement() {
      const {
        closable,
        prefixCls,
        width,
        height,
        title,
        footer: tempFooter,
        bodyStyle,
        visible,
        bodyProps,
        forceRender,
        closeIcon,
        dialogStyle = {},
        dialogClass = "",
      } = props;
      const dest = { ...dialogStyle };
      if (width !== void 0) {
        dest.width = typeof width === "number" ? `${width}px` : width;
      }
      if (height !== void 0) {
        dest.height = typeof height === "number" ? `${height}px` : height;
      }

      let footer;
      if (tempFooter) {
        footer = (
          <div key="footer" class={`${prefixCls}-footer`} ref={refs.footer}>
            {tempFooter}
          </div>
        );
      }

      let header;
      if (title) {
        header = (
          <div key="header" class={`${prefixCls}-header`} ref={refs.header}>
            <div class={`${prefixCls}-title`} id={state.titleId}>
              {title}
            </div>
          </div>
        );
      }

      let closer;
      if (closable) {
        closer = (
          <button
            type="button"
            key="close"
            onClick={methods.close || noop}
            aria-label="Close"
            class={`${prefixCls}-close`}
          >
            {closeIcon || <span class={`${prefixCls}-close-x`} />}
          </button>
        );
      }
      const { style: stl, class: className } = core.attrs();
      const style = { ...stl, ...dest };
      const sentinelStyle = { width: 0, height: 0, overflow: "hidden" };
      const cls = [prefixCls, className, dialogClass];
      const transitionName = methods.getTransitionName();
      const dialogElement = (
        <LazyRenderBox
          directives={[{ name: "show", value: visible }]}
          key="dialog-element"
          role="document"
          ref={refs.dialog}
          class={cls}
          forceRender={forceRender}
          onMousedown={maskEventHandle.onDialogMouseDown}
        >
          <div tabindex={0} ref={refs.sentinelStart} style={sentinelStyle} aria-hidden="true" />
          <div class={`${prefixCls}-content`} style={style}>
            {closer}
            {header}
            <div
              key="body"
              class={`${prefixCls}-body`}
              style={bodyStyle}
              ref={refs.body}
              {...bodyProps}
            >
              {options?.slots?.default?.(void 0) || core.getSlot()}
            </div>
            {footer}
          </div>
          <div tabindex={0} ref={refs.sentinelEnd} style={sentinelStyle} aria-hidden="true" />
        </LazyRenderBox>
      );
      const dialogTransitionProps = getTransitionProps(transitionName!, {
        onAfterLeave: methods.onAnimateLeave,
        onBeforeLeave: (target) => {
          console.log("record onBeforeLeave", target);
          methods.updatedCallback(true, target);
        },
        onBeforeEnter: (target) => {
          temp.openTime = Date.now();
          requestAnimationFrame(() => {
            console.log("record onBeforeEnter", target);
            methods.updatedCallback(false, target);
          });
        },
      });
      // console.log(
      //   dialogElement,
      //   transitionName,
      //   dialogTransitionProps,
      //   <Transition key="dialog" {...dialogTransitionProps}>
      //     {visible || !props.destroyOnClose ? dialogElement : null}
      //   </Transition>
      // );
      return (
        <Transition key="dialog" {...dialogTransitionProps}>
          {visible || !props.destroyOnClose ? dialogElement : null}
        </Transition>
      );
    },
    getMaskElement() {
      return (
        props.mask && (
          <Mask
            visible={props.visible!}
            prefixCls={props.prefixCls}
            transitionName={props.maskTransitionName}
            animation={props.maskAnimation}
            style={maskStyle.value}
            {...props.maskProps}
          />
        )
      );
    },
    getMaskTransitionName() {
      // const props = core.getOptionProps();
      let transitionName = props.maskTransitionName;
      const animation = props.maskAnimation;
      if (!transitionName && animation) {
        transitionName = `${props.prefixCls}-${animation}`;
      }
      return transitionName;
    },
    getTransitionName() {
      // const props = core.getOptionProps();
      let transitionName = props.transitionName;
      const animation = props.animation;
      if (!transitionName && animation) {
        transitionName = `${props.prefixCls}-${animation}`;
      }
      return transitionName;
    },
    // setScrollbar() {
    //   if (props.bodyIsOverflowing && props.scrollbarWidth !== void 0) {
    //     document.body.style.paddingRight = `${props.scrollbarWidth}px`;
    //   }
    // },
    switchScrollingEffect() {
      props.switchScrollingEffect();
    },
    close(e: any) {
      core.__emit("close", e);
    },
  };
  const getters = reactive({
    mask: computed(() => methods.getMaskElement()),
  });
  return {
    props,
    state,
    methods,
    provide() {
      DialogContext.provide({
        props,
        state,
        methods,
      });
    },
    mounted() {
      methods.updatedCallback(false);
      // if forceRender is true, set element style display to be none;
      if ((props.forceRender || (props.getContainer === false && !props.visible)) && $refs.wrap) {
        $refs.wrap.style.display = "none";
      }
    },
    dispose() {
      // portal.beforeUnmount();
      const { visible, getOpenCount } = props;
      if ((visible || state.inTransition) && (!getOpenCount || !getOpenCount!())) {
        methods.switchScrollingEffect();
        maskEventHandle.dispose();
      }
    },
    linkWatch() {
      // watch(
      //   () => props.visible,
      //   (visible) => {
      //     nextTick(() => {
      //       console.log("change updatedCallback", visible);
      //       // methods.updatedCallback(!visible)
      //     });
      //   }
      // );
    },
    render() {
      const { prefixCls, maskClosable, visible, wrapClassName, title, wrapProps } = props;
      const style = { ...wrapStyle.value };
      // clear hide display
      // and only set display after async anim, not here for hide
      if (visible) {
        style.display = null;
      }
      return (
        <div class={`${prefixCls}-root`}>
          {getters.mask}
          <div
            tabindex={-1}
            onKeydown={methods.onKeydown}
            class={`${prefixCls}-wrap ${wrapClassName || ""}`}
            ref={refs.wrap}
            onClick={maskClosable ? maskEventHandle.onMaskClick : noop}
            onMouseup={maskClosable ? maskEventHandle.onMaskMouseUp : noop}
            role="dialog"
            aria-labelledby={title ? state.titleId : null}
            style={style}
            {...wrapProps}
          >
            {methods.getDialogElement()}
          </div>
        </div>
      );
    },
  };
}
