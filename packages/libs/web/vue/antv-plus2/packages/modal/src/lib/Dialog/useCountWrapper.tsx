import { CSSProperties } from "@yuyi919/shared-types";
import { DomUtils } from "@antv-plus2/helper";
// @ts-ignore
import Portal from "ant-design-vue/es/_util/Portal";
// import Portal from './Portal';
import { watch } from "vue-demi";
const { switchScrollingEffect } = DomUtils;

/**
 * Easy to set element style, return previous style
 * IE browser compatible(IE browser doesn't merge overflow style, need to set it separately)
 * https://github.com/ant-design/ant-design/issues/19393
 *
 */
export interface SetStyleOptions {
  element?: HTMLElement;
}
function setStyle(style: CSSProperties, options: SetStyleOptions = {}): CSSProperties {
  const { element = document.body } = options;
  const oldStyle: any = {};

  for (const key in style) {
    const k = key as keyof CSSProperties;
    oldStyle[k] = (element.style as CSSProperties)[k];
    // (element.style as any)[k] = (style as CSSProperties)[k];
  }
  Object.assign(element.style, style);
  // const styleKeys = Object.keys(style);

  // // IE browser compatible
  // styleKeys.forEach(key => {
  //   oldStyle[key] = element.style[key];
  // });

  // styleKeys.forEach(key => {
  //   element.style[key] = style[key];
  // });

  return oldStyle as CSSProperties;
}

let openCount = 0;
const windowIsUndefined = !(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);
// https://github.com/ant-design/ant-design/issues/19340
// https://github.com/ant-design/ant-design/issues/19332
let cacheOverflow: CSSProperties = {};
type PortalWrapperProps = {
  wrapClassName: string | undefined;
  forceRender?: boolean | undefined;
  getContainer?: any;
  visible?: boolean | undefined;
};
export function usePortalWrapper(props: PortalWrapperProps) {
  const cache = {
    _component: null as unknown as HTMLDivElement | null,
    container: null as unknown as HTMLDivElement | null,
  };
  const { visible } = props;
  if (visible) {
    openCount++;
  }
  const options = {
    linkWatch() {
      watch(
        () => props.visible,
        (visible) => {
          openCount = visible ? openCount + 1 : openCount - 1;
        }
      );
      watch(
        () => props.getContainer,
        (getContainer, prevGetContainer) => {
          const getContainerIsFunc =
            typeof getContainer === "function" && typeof prevGetContainer === "function";
          if (
            getContainerIsFunc
              ? getContainer.toString() !== prevGetContainer.toString()
              : getContainer !== prevGetContainer
          ) {
            methods.removeCurrentContainer(false);
          }
        }
      );
    },
    updated() {
      methods.setWrapperClassName();
    },
    beforeUnmount() {
      const { visible } = props;
      // 离开时不会 render， 导到离开时数值不变，改用 func 。。
      openCount = visible && openCount ? openCount - 1 : openCount;
      methods.removeCurrentContainer(visible);
    },
    methods: {
      getParent() {
        const { getContainer } = props;
        if (getContainer) {
          if (typeof getContainer === "string") {
            return document.querySelectorAll(getContainer)[0];
          }
          if (typeof getContainer === "function") {
            return getContainer();
          }
          if (typeof getContainer === "object" && getContainer instanceof window.HTMLElement) {
            return getContainer;
          }
        }
        return document.body;
      },

      getDomContainer() {
        if (windowIsUndefined) {
          return null;
        }
        if (!cache.container) {
          cache.container = document.createElement("div");
          const parent = methods.getParent();
          if (parent) {
            parent.appendChild(cache.container);
          }
        }
        methods.setWrapperClassName();
        return cache.container;
      },

      setWrapperClassName() {
        const { wrapClassName: wrapperClassName } = props;
        if (cache.container && wrapperClassName && wrapperClassName !== cache.container.className) {
          cache.container.className = wrapperClassName;
        }
      },

      savePortal(c: any) {
        // Warning: don't rename _component
        // https://github.com/react-component/util/pull/65#discussion_r352407916
        cache._component = c;
      },

      removeCurrentContainer(visible?: boolean) {
        cache.container = null;
        cache._component = null;
      },

      /**
       * Enhance ./switchScrollingEffect
       * 1. Simulate document body scroll bar with
       * 2. Record body has overflow style and recover when all of PortalWrapper invisible
       * 3. Disable body scroll when PortalWrapper has open
       *
       */
      switchScrollingEffect() {
        if (openCount === 1 && !Object.keys(cacheOverflow).length) {
          if (cacheOverflow.hasOwnProperty("overflowX")) {
            return;
          }
          switchScrollingEffect();
          // Must be set after switchScrollingEffect
          cacheOverflow = setStyle({
            overflow: "hidden",
            overflowX: "hidden",
            overflowY: "hidden",
          });
          // console.log("open", cacheOverflow)
        } else if (!openCount) {
          // IE browser doesn't merge overflow style, need to set it separately
          // https://github.com/ant-design/ant-design/issues/19393
          setStyle(cacheOverflow);
          cacheOverflow = {};
          switchScrollingEffect(true);
        }
      },
    },

    render(children: (...args: any[]) => any) {
      const { forceRender, visible } = props;
      let portal: JSX.Element | null = null;
      if (forceRender || visible || cache._component) {
        portal = (
          <Portal
            key="portal"
            props={{
              getContainer: methods.getDomContainer,
              children: children(),
            }}
            ref={methods.savePortal}
          />
        );
      }
      return portal;
    },
  };
  const { methods } = options;
  return [
    {
      getOpenCount: () => openCount,
      getContainer: methods.getDomContainer,
      switchScrollingEffect: methods.switchScrollingEffect,
    },
    {
      ...options,
    },
  ] as const;
}
