/* eslint-disable no-redeclare */
import { TypeTsxProps, VCProps } from "@antv-plus2/helper";
import {
  ISelectOptionEvents,
  ISelectOptionProps,
  ISelectOptionPublicMembers,
  ISelectOptionScopedSlots
} from "ant-design-vue";
import type { Option as AntSelectOption } from "ant-design-vue/types/select/option";

declare module "ant-design-vue/types/ant-design-vue.d" {
  export interface ISelectOptionProps extends VCProps<AntSelectOption, false> {}
  export interface ISelectOptionEvents {
    change: any;
  }
  export interface ISelectOptionScopedSlots {}
  export interface ISelectOptionPublicMembers {}
}
declare module "ant-design-vue/types/select/option.d" {
  interface SelectOption extends ISelectOptionPublicMembers {
    $props: TypeTsxProps<ISelectOptionProps, ISelectOptionEvents, ISelectOptionScopedSlots>;
  }
}

export type { AntSelectOption };
