/* eslint-disable no-redeclare */
import { Checkbox as AntCheckbox } from "ant-design-vue";
import { getPropsClass, VCProps, TypeTsxProps } from "@antv-plus2/helper";

declare module "ant-design-vue/types/ant-design-vue.d" {
  export interface ICheckboxProps extends VCProps<AntCheckbox, false> {
    maskStyle?: any;
  }
  export interface ICheckboxEvents {
    change: InputEvent;
  }
  export interface ICheckboxScopedSlots {}
  export interface ICheckboxPublicMembers {}
  export interface Checkbox extends ICheckboxPublicMembers {
    $props: TypeTsxProps<ICheckboxProps, ICheckboxEvents>;
  }
}

export const CheckboxProps = getPropsClass(AntCheckbox);

export { AntCheckbox };
