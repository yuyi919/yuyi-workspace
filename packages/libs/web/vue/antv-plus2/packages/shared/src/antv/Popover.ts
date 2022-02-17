/* eslint-disable no-redeclare */
import { getPropsClass, TypeTsxProps, VCProps } from "@antv-plus2/helper";
import { Popover, Popconfirm } from "ant-design-vue";

declare module "ant-design-vue/types/ant-design-vue.d" {
  interface IPopoverProps extends VCProps<Popover, false> {
    disabled?: boolean;
    okButtonProps?: any;
    cancelButtonProps?: any;
  }
  interface IPopoverEvents {}
  interface IPopoverScopedSlots {}
  interface IPopoverPublicMembers {}
  interface Popover extends IPopoverPublicMembers {
    $props: TypeTsxProps<IPopoverProps, IPopoverEvents>;
  }
  interface IPopconfirmProps extends VCProps<Popconfirm, false> {}
  interface IPopconfirmEvents {
    confirm: PointerEvent;
  }
  interface IPopconfirmScopedSlots {}
  interface IPopconfirmPublicMembers {}
  interface Popconfirm extends IPopconfirmPublicMembers {
    $props: TypeTsxProps<IPopconfirmProps, IPopconfirmEvents>;
  }
}

export const AntPopconfirmProps = getPropsClass(Popconfirm);
export const AntPopoverProps = getPropsClass(Popover);
