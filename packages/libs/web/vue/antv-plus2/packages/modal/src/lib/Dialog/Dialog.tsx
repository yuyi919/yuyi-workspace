import { DomUtils, extractProps, initDefaultProps } from "@antv-plus2/helper";
import { NativeScrollbarMixins } from "@antv-plus2/shared";
import { createUseClasses, styled } from "@antv-plus2/theme";
import { createContext } from "@yuyi919/vue-use";
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  reactive,
  toRef,
  toRefs,
} from "vue-demi";
import { DialogProps } from "./DialogProps";
import { usePortalWrapper } from "./useCountWrapper";
import { useDialog } from "./useDialog";

// const [props, configure] = extractUnsafeProps(DialogProps);
let mousePosition = null as { x: number; y: number } | null;
// ref: https://github.com/ant-design/ant-design/issues/15795
const getClickPosition = (e: MouseEvent) => {
  mousePosition = {
    x: e.pageX,
    y: e.pageY,
  };
  // console.log("mousePosition", mousePosition);
  // 100ms 内发生过点击事件，则从点击位置动画展示
  // 否则直接 zoom 展示
  // 这样可以兼容非点击方式展开
  setTimeout(() => (mousePosition = null), 100);
};

// 只有点击事件支持从鼠标位置动画展开
if (typeof window !== "undefined" && window.document && window.document.documentElement) {
  DomUtils.on(document.documentElement, "click", getClickPosition, true);
}

export const MousePositionContext = createContext("mousePosition", () => mousePosition);
const [classes, useClasses] = createUseClasses("dialog", {});
const useStyles = styled.makeUse`
  &${classes.root} {
    .ant-modal-wrap {
      ${NativeScrollbarMixins("9px", "white")};
      &.ant-modal-centered {
        text-align: center;
        &:before {
          content: unset;
        }
        & .ant-modal {
          align-items: center;
          min-height: 100%;
          overflow: auto;
          & .ant-modal-content {
            /* max-height: calc(100% - 7.5rem); */
          }
          & .ant-modal-body {
            height: unset;
          }
        }
      }
      &.scrollBehavior--inside {
        & .ant-modal {
          height: 100%;
          & .ant-modal-content {
            max-height: calc(100% - 7.5rem);
          }
          & .ant-modal-body {
            ${NativeScrollbarMixins("11px", "rgb(206, 206, 206)")};
            height: 100%;
          }
        }
      }
    }
    .ant-modal {
      width: 100% !important;
      /* transition: all 0.3s ease-in-out; */
      top: unset;
      padding-bottom: unset;
      overflow: hidden;
      & {
        margin: unset;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        & .ant-modal-content {
          height: unset;
          margin: 3.75rem 0;
        }
      }
    }
    .ant-modal-content {
      margin: 3.75rem auto;
      /* transition: all 0.3s ease-in-out; */
      display: flex;
      flex-direction: column;
      position: relative;
      width: 100%;
      height: 100%;
      outline: transparent solid 2px;
      outline-offset: 2px;
      color: inherit;
    }
    .ant-modal-body {
      height: auto;
      overflow: auto;
    }
  }
`;

export const Dialog = defineComponent({
  install: () => {},
  name: "Dialog",
  props: {
    ...initDefaultProps(extractProps(DialogProps), {
      mask: true,
      visible: false,
      keyboard: true,
      closable: true,
      maskClosable: true,
      destroyOnClose: false,
      prefixCls: "rc-dialog",
      focusTriggerAfterClose: true,
      getOpenCount: () => null,
      width: 520,
      transitionName: "zoom",
      maskTransitionName: "fade",
      // confirmLoading: false,
      // okType: "primary",
    }),
    centered: {
      type: Boolean,
      default: false,
    },
    scrollBehavior: String,
  },
  setup(props, context) {
    const classes = useClasses(useStyles({}));
    const wrapClassNameRef = computed(() => {
      return [props.wrapClassName, classes.root].filter(Boolean).join(" ");
    });
    const [portalProps, portal] = usePortalWrapper(
      reactive({
        wrapClassName: wrapClassNameRef,
        getContainer: computed(() => props.getContainer || (() => document.body)),
        forceRender: toRef(props, "forceRender"),
        visible: toRef(props, "visible"),
      })
    );

    // // @ts-ignore
    const mousePosition = MousePositionContext.inject?.()!;
    // console.log("mousePosition", mousePosition)
    const dialog = useDialog(
      reactive({
        ...toRefs(props),
        ...portalProps,
        wrapClassName: computed(() =>
          [
            props.centered && "ant-modal-centered",
            props.scrollBehavior === "inside" && "scrollBehavior--inside",
          ]
            .filter(Boolean)
            .join(" ")
        ),
        get mousePosition() {
          return mousePosition()!;
        },
        afterClose: computed(() => {
          return () => {
            dialog.dispose();
            return props.afterClose?.();
          };
        }),
      }),
      {
        slots: context.slots as any,
        on: {
          close(e) {
            context.emit("close", e);
          },
        },
      }
    );
    portal.linkWatch();
    dialog.linkWatch();
    onMounted(() => {
      dialog.mounted();
    });
    onBeforeUnmount(() => {
      portal.beforeUnmount();
    });
    return () => {
      return portal.render(() => dialog.render());
    };
  },
});
// console.log(<Dialog  />);
// type a = ExtractPropTypes<typeof Dialog['props']>
// type b = ExtractDefaultPropTypes<typeof Dialog['props']>
