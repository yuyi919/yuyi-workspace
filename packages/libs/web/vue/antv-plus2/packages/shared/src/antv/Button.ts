import { getPropsClass, ResolveSubModule, TypeTsxProps, VCProps } from "@antv-plus2/helper";
import {
  Button,
  IButtonEvents,
  IButtonGroupEvents,
  IButtonGroupProps,
  IButtonProps,
  IButtonPublicMembers,
} from "ant-design-vue";

declare module "ant-design-vue/types/ant-design-vue.d" {
  export interface IButtonProps extends VCProps<Omit<Button, "type">, false> {
    type?: Button["type"];
  }
  export interface IButtonEvents {
    click: MouseEvent;
  }
  export interface IButtonScopedSlots {}
  export interface IButtonPublicMembers {}
  export interface IButtonGroupProps extends VCProps<ResolveSubModule<typeof Button, "Group">> {
    [key: string]: any;
  }
  export interface IButtonGroupEvents {}
  export interface IButtonGroupScopedSlots {}
  export interface IButtonGroupPublicMembers {}
}

declare module "ant-design-vue/types/button/button-group.d" {
  interface ButtonGroup extends IButtonPublicMembers {
    $props: TypeTsxProps<IButtonGroupProps, IButtonGroupEvents>;
  }
}

declare module "ant-design-vue/types/button/button.d" {
  interface Button extends IButtonPublicMembers {
    $props: TypeTsxProps<IButtonProps, IButtonEvents>;
  }
}

export { Button };

export const AntButtonProps = getPropsClass(Button);
