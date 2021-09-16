import { createProtalModal, IPortalModalOptions } from "./portal";
import Vue from "vue";
import { IModalAction } from "./context";

export * from "./modal";
export * from "./portal";
export * from "./props";
export * from "./context";
export * from "./Manager";
export * from "./confirm";
export * from "./dialog";

export default function install(vue: typeof Vue) {
  vue.prototype.$customModal = function $customModal(this: Vue, config: IPortalModalOptions) {
    return createProtalModal(config, this);
  };
}

declare module "vue/types/vue" {
  interface Vue {
    $customModal?: (config: IPortalModalOptions) => IModalAction;
  }
}
