/* eslint-disable no-redeclare */
import type { InputGroup } from "ant-design-vue/types/input/input-group";
import { TypeTsxProps, VCProps } from "@antv-plus2/helper";
import { IInputGroupPublicMembers, IInputGroupProps, IInputGroupEvents } from "ant-design-vue";

declare module "ant-design-vue/types/ant-design-vue.d" {
  export interface IInputGroupProps extends VCProps<InputGroup, false> {}

  export interface IInputGroupEvents {}
  export interface IInputGroupScopedSlots {}
  export interface IInputGroupPublicMembers {}
}

declare module "ant-design-vue/types/input/input-group.d" {
  interface InputGroup extends IInputGroupPublicMembers {
    $props: TypeTsxProps<IInputGroupProps, IInputGroupEvents>;
  }
}

export { InputGroup };
