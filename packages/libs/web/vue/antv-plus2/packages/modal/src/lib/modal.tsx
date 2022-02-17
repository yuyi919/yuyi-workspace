import { computed, defineComponent, ref } from "vue-demi";
import { useInherit, useNamedRef } from "@yuyi919/vue-use";
import { extractProps, useSlot } from "@antv-plus2/helper";
import { IColProps } from "ant-design-vue";
import { pick } from "lodash";
import { ActionGroup, ActionType, IActionConfig } from "@antv-plus2/action";
import { NormalizeModalPlacement } from "./NormalizeModalProps";
import { NormlizeDrawer } from "./NormlizeDrawer";
import { NormlizeModal } from "./NormlizeModal";
import { IModalProps, ModalProps } from "./props";
import { useClasses, useStyles } from "./styles";
import { InnerModalContext } from "./context";

export function getGridProps(props: IColProps) {
  return pick(props, "md", "lg", "sm", "span", "xs", "xl", "xxl");
}

export const Modal = defineComponent({
  props: extractProps(ModalProps),
  model: {
    prop: "visible",
    event: "change",
  },
  emits: ["ok", "cancel", "close", "change"],
  setup(props: IModalProps, context) {
    const innerModal = ref();
    InnerModalContext.provide(innerModal);
    const classes = useClasses(useStyles(props));
    const actionsRef = useNamedRef("actionsRef");
    const [getInherit, inheritEvent] = useInherit(context, ["cancel", "close", "ok"]);
    const okAction = computed(() => {
      const {
        props: { type = props.okType, ...btnProps } = {},
        title = props.okText,
        ...other
      } = props.okButtonProps || {};
      return {
        type: "submit",
        action: inheritEvent.ok,
        title,
        props: {
          ...btnProps,
          type,
        },
        ...other,
        //@ts-ignore
      } as IActionConfig<"submit">;
    });
    const cancelAction = computed(() => {
      const { title = props.cancelText, ...other } = props.cancelButtonProps || {};
      return {
        action: inheritEvent.cancel,
        type: ActionType.取消,
        title,
        ...other,
      };
    });
    const renderFooter = useSlot("footer", (actionAlign?: "left" | "right" | "center") => (
      <ActionGroup
        defaultSpinningProps={{ ghost: true }}
        align={actionAlign}
        reverse={props.actionProps?.flex === true ? false : props.placement === "right"}
        actions={props.actions || ([cancelAction.value, okAction.value] as IActionConfig[])}
        props={props.actionProps}
      />
    ));
    const renderTitle = useSlot("title");
    // watch(
    //   () => props.loading,
    //   (loading) => {
    //     if (loading) actionsRef.value?.spinningStart("load");
    //     else actionsRef.value?.spinningEnd("load");
    //   },
    //   { immediate: true }
    // );
    const placementConfig: Record<
      NormalizeModalPlacement,
      { actionAlign?: string; component: typeof NormlizeModal }
    > = {
      left: { actionAlign: "right", component: NormlizeDrawer },
      right: { actionAlign: "left", component: NormlizeDrawer },
      top: { actionAlign: "center", component: NormlizeDrawer },
      bottom: { actionAlign: "center", component: NormlizeDrawer },
      center: { actionAlign: "center", component: NormlizeModal },
    };
    return () => {
      const {
        scopedSlots,
        children,
        props: {
          gridProps,
          cancelButtonProps,
          okText,
          okType,
          cancelText,
          okButtonProps,
          footer,
          title,
          loading,
          ...props
        },
        on,
      } = getInherit<IModalProps>();
      const { component: Renderer, actionAlign } = placementConfig[
        props.placement as NormalizeModalPlacement
      ] || {
        component: NormlizeModal,
      };
      return (
        <Renderer
          class={[classes.root, props.classNames!.root]}
          {...{
            props: {
              ...props,
              footer: footer !== false && renderFooter(actionAlign),
              title: title !== false && renderTitle(),
            },
            scopedSlots,
            on,
          }}
          onClose={inheritEvent.close}
        >
          {children}
        </Renderer>
      );
    };
  },
});
