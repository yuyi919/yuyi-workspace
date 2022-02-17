import { defineAsyncComponent, defineComponent, h, PropType } from "vue-demi";
import { VueComponent2 } from "../helper";
import type { ActionGroupProps } from "./Props";

// export * from "./InjectMixins";

export const ActionGroup = defineAsyncComponent({
  loader: () => import("./component"),
  loadingComponent: defineComponent({
    props: { actions: null as unknown as PropType<ActionGroupProps["actions"]> },
    render() {
      // console.log("loadingComponent", this.actions);
      return h("div", { style: { height: "32px" } });
    },
  }),
}) as unknown as VueComponent2<ActionGroupProps, { action: (name: string, type: any) => any }>;

export default ActionGroup;
export * from "./interface";
export type { ActionGroupProps } from "./Props";
