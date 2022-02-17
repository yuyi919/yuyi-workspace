import { extractProps, TypedPropsGroup, VueComponent2 } from "@antv-plus2/helper";
import { useChildren, useInherit, useNamedRef, useQuerySelector } from "@yuyi919/vue-use";
import { Drawer, IDrawerProps } from "ant-design-vue";
import {
  computed,
  defineComponent,
  nextTick,
  onUnmounted,
  provide,
  reactive,
  watch,
} from "vue-demi";
import { AutoSizer, AutoSizerAction } from "@antv-plus2/shared";
import { InnerModalContext } from "../context";
import { useContentRender } from "../hooks";
import { INormalizeModalProps, NormalizeModalProps } from "../NormalizeModalProps";
import { PADDING, useClasses, useStyles } from "./styles";

export const NormlizeDrawer: VueComponent2<INormalizeModalProps, { close: any; change: any }> =
  defineComponent({
    props: extractProps(NormalizeModalProps),
    emits: ["close", "change"],
    setup(props, context) {
      const modalRef = useNamedRef("inner_model");
      const innerModalRef = InnerModalContext.inject();
      watch(
        () => modalRef.value,
        (el) => {
          nextTick(() => {
            innerModalRef.value = el;
          });
        }
      );
      provide("parentDrawer", props.parentModal?.getInnerModal());
      const [getInherit, inheritEvent] = useInherit(context, ["close", "change"]);
      const sizerRef = useNamedRef<AutoSizerAction>("sizerRef");
      /**
       * 是否自动检测抽屉尺寸
       */
      const useAutoSizer = computed(() => {
        const { width } = props;
        return width === "auto" || !width;
      });
      const isVerticalDrawer = computed(() => {
        const { placement } = props;
        return placement === "top" || placement === "bottom";
      });
      const contentSize = reactive({
        width: props.width,
        height: void 0,
        minWidth: 220, // window.innerWidth / 4,
      });
      const classes = useClasses<"c-">(useStyles(props));
      const controlProps = computed(() => {
        const enableAutoSize = useAutoSizer.value;
        return {
          drawer: {
            width: enableAutoSize ? contentSize.width : props.width,
            // 传递null使height无效化，而void 0等于不传
            height: isVerticalDrawer.value ? null : void 0,
          } as IDrawerProps,
          autoSizer: enableAutoSize && {
            props: {
              nowrap: true,
              minWidth: contentSize.minWidth,
              maxWidth: windowSize.width - PADDING * 2,
              // 当挤满屏幕时，横向尺寸会偏大，让侧边滚动条被遮住 TODO
              // - (props.placement === "top" || props.placement === "bottom" ? 10 : 0)
              maxHeight: windowSize.height - PADDING * 2,
            },
            on: {
              "update:width": (width: number) => {
                contentSize.width = width + PADDING * 2; // 容器padding
              },
            },
          },
        };
      });
      function afterVisibleChange(visible: boolean) {
        if (props.afterClose && !visible) props.afterClose();
      }

      const childrenRef = useChildren();
      let prev: number | undefined;
      watch(
        childrenRef,
        () => {
          if (typeof prev === "number") {
            cancelAnimationFrame(prev);
            prev = void 0;
          }
          prev = requestAnimationFrame(() => {
            sizerRef.value?.forceUpdate();
          });
        },
        {
          immediate: childrenRef.value?.length > 0,
        }
      );
      onUnmounted(() => {
        if (typeof prev === "number") {
          cancelAnimationFrame(prev);
        }
      });
      const headerSelector = useQuerySelector(".ant-drawer-header");
      function handleClose(e: Event) {
        inheritEvent.close(e);
        inheritEvent.change(false);
      }

      const [renderScrollbar, windowSize] = useContentRender(props, headerSelector);
      return () => {
        const {
          children,
          on,
          props: {
            footer,
            classNames,
            transitionType,
            transitionDuration,
            afterClose,
            placement,
            ...props
          },
        } = getInherit<INormalizeModalProps>();
        const { drawer, autoSizer } = controlProps.value;
        return (
          <Drawer
            ref={modalRef}
            class={[classes.root, classNames?.root]}
            onClose={handleClose}
            {...{
              props: {
                ...props,
                ...drawer,
                wrapClassName: classNames?.wrap,
                afterVisibleChange,
                placement: placement as Exclude<
                  INormalizeModalProps["placement"],
                  "center" | "default" | null
                >,
              },
              on,
            }}
          >
            {renderScrollbar(
              autoSizer ? (
                <AutoSizer ref={sizerRef} mergeJsxProps={[autoSizer]}>
                  {children}
                </AutoSizer>
              ) : (
                children
              ),
              classes.content
            )}
            {footer && <div class={["ant-modal-footer", classes.footer]}>{footer}</div>}
          </Drawer>
        );
      };
    },
  });
