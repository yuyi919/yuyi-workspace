import { CSSProperties } from "@yuyi919/shared-types";
import type { Ref } from "vue-demi";
import { h, defineComponent, getCurrentInstance, nextTick, onUpdated } from "vue-demi";
import { noop, VueComponent2 } from "./index";
import type { TransitionGroupProps, TransitionProps } from "../types/builtin-components";
// import animate from "./css-animation";
// import "./css-animation.less";
export const getTransitionProps = (
  transitionName: string,
  opt: Partial<BaseTransitionProps<Element>> = {}
) => {
  if (process.env.NODE_ENV === "test") {
    return opt;
  }
  // const { appear = true, tag, nativeOn } = opt;
  // const transitionProps = {
  //   props: {
  //     appear,
  //     css: false,
  //   },
  //   on: {
  //     beforeEnter: opt.onBeforeEnter || noop,
  //     enter:
  //       opt.onEnter ||
  //       function (el, done) {
  //         animate(el, transitionName + "-enter", done);
  //       },
  //     afterEnter: opt.onAfterEnter || noop,
  //     beforeLeave: opt.onBeforeLeave || noop,
  //     leave:
  //       opt.onLeave ||
  //       function (el, done) {
  //         animate(el, transitionName + "-leave", done);
  //       },
  //     afterLeave: opt.onAfterLeave || noop,
  //   },
  //   nativeOn: nativeOn,
  // } as any;
  // // transition-group
  // if (tag) {
  //   transitionProps.tag = tag;
  // }
  // return transitionProps;
  const transitionProps = transitionName
    ? ({
        appear: true,
        // appearFromClass: `${transitionName}-appear ${transitionName}-appear-prepare`,
        // appearActiveClass: `antdv-base-transtion`,
        appearToClass: `${transitionName}-appear ${transitionName}-appear-active`,
        enterActiveClass: `${transitionName}-enter ${transitionName}-enter-prepare`,
        // enterActiveClass: `antdv-base-transtion`,
        enterToClass: `${transitionName}-enter ${transitionName}-enter-active`,
        leaveFromClass: ` ${transitionName}-leave`,
        leaveActiveClass: `${transitionName}-leave ${transitionName}-leave-active`,
        leaveToClass: `${transitionName}-leave ${transitionName}-leave-active`,
        ...opt,
        on: {
          beforeEnter: opt.onBeforeEnter || noop,
          enter: opt.onEnter || noop,
          afterEnter: opt.onAfterEnter || noop,
          beforeLeave: opt.onBeforeLeave || noop,
          leave: opt.onLeave || noop,
          afterLeave: opt.onAfterLeave || noop,
        },
      } as TransitionProps)
    : { css: false, ...opt };
  return transitionProps;
};

export const getTransitionGroupProps = (
  transitionName: string,
  opt: Partial<BaseTransitionProps<Element>> = {}
) => {
  const transitionProps = transitionName
    ? {
        appear: true,
        // appearFromClass: `${transitionName}-appear ${transitionName}-appear-prepare`,
        appearActiveClass: `${transitionName}`,
        appearToClass: `${transitionName}-appear ${transitionName}-appear-active`,
        enterFromClass: `${transitionName}-appear ${transitionName}-enter ${transitionName}-appear-prepare ${transitionName}-enter-prepare`,
        enterActiveClass: `${transitionName}`,
        enterToClass: `${transitionName}-enter ${transitionName}-appear ${transitionName}-appear-active ${transitionName}-enter-active`,
        leaveActiveClass: `${transitionName} ${transitionName}-leave`,
        leaveToClass: `${transitionName}-leave-active`,
        ...opt,
      }
    : { css: false, ...opt };
  return transitionProps;
};

let Transition = "transition" as unknown as VueComponent2<TransitionProps>;
let TransitionGroup = "transition-group" as unknown as VueComponent2<TransitionGroupProps>;

if (process.env.NODE_ENV === "test") {
  Transition = defineComponent({
    name: "TransitionForTest",
    inheritAttrs: false,
    setup(_props, { slots, attrs }) {
      const instance = getCurrentInstance();
      onUpdated(() => {
        // @ts-ignore
        const child = instance.subTree.children[0];
        if (child && child.dirs && child.dirs[0]) {
          const value = child.dirs[0].value;
          const oldValue = child.dirs[0].oldValue;
          if (!value && value !== oldValue) {
            nextTick(() => {
              if (attrs.onAfterLeave) {
                (attrs as any).onAfterLeave(instance.vnode.elm);
              }
            });
          }
        }
      });
      return () => {
        return slots.default?.();
      };
    },
  }) as any;
  TransitionGroup = defineComponent({
    name: "TransitionGroupForTest",
    inheritAttrs: false,
    props: ["tag", "class"],
    setup(props, { slots }) {
      return () => {
        const { tag: Tag, ...rest } = props as any;
        const children = slots.default?.() || [];
        if (Tag) {
          return h(Tag, rest, [children]);
        } else {
          return children;
        }
      };
    },
  });
}

export declare type MotionEvent = (TransitionEvent | AnimationEvent) & {
  deadline?: boolean;
};

export declare type MotionEventHandler = (element: Element, done?: () => void) => CSSProperties;

export declare type MotionEndEventHandler = (element: Element, done?: () => void) => boolean | void;

// ================== Collapse Motion ==================
const getCollapsedHeight: MotionEventHandler = () => ({ height: 0, opacity: 0 });
const getRealHeight: MotionEventHandler = (node) => ({
  height: `${node.scrollHeight}px`,
  opacity: 1,
});
const getCurrentHeight: MotionEventHandler = (node: any) => ({ height: `${node.offsetHeight}px` });
// const skipOpacityTransition: MotionEndEventHandler = (_, event) =>
//   (event as TransitionEvent).propertyName === 'height';

export declare interface RendererElement extends RendererNode {}

export declare interface RendererNode {
  [key: string]: any;
}

export declare interface BaseTransitionProps<HostElement = RendererElement> {
  mode?: "in-out" | "out-in" | "default";
  appear?: boolean;
  tag?: any;
  nativeOn?: any;
  persisted?: boolean;
  onBeforeEnter?: (el: HostElement) => void;
  onEnter?: (el: HostElement, done: () => void) => void;
  onAfterEnter?: (el: HostElement) => void;
  onEnterCancelled?: (el: HostElement) => void;
  onBeforeLeave?: (el: HostElement) => void;
  onLeave?: (el: HostElement, done: () => void) => void;
  onAfterLeave?: (el: HostElement) => void;
  onLeaveCancelled?: (el: HostElement) => void;
  onBeforeAppear?: (el: HostElement) => void;
  onAppear?: (el: HostElement, done: () => void) => void;
  onAfterAppear?: (el: HostElement) => void;
  onAppearCancelled?: (el: HostElement) => void;
}

export interface CSSMotionProps extends Partial<BaseTransitionProps<Element>> {
  name?: string;
  css?: boolean;
}

const collapseMotion = (style: Ref<CSSProperties>, className: Ref<string>): CSSMotionProps => {
  return {
    name: "ant-motion-collapse",
    appear: true,
    css: true,
    onBeforeEnter: (node) => {
      className.value = "ant-motion-collapse";
      style.value = getCollapsedHeight(node);
    },
    onEnter: (node) => {
      nextTick(() => {
        style.value = getRealHeight(node);
      });
    },
    onAfterEnter: () => {
      className.value = "";
      style.value = {};
    },
    onBeforeLeave: (node) => {
      className.value = "ant-motion-collapse";
      style.value = getCurrentHeight(node);
    },
    onLeave: (node) => {
      window.setTimeout(() => {
        style.value = getCollapsedHeight(node);
      });
    },
    onAfterLeave: () => {
      className.value = "";
      style.value = {};
    },
  };
};

export { Transition, TransitionGroup, collapseMotion };
