/* eslint-disable no-redeclare */
import { Select as AntSelect } from "ant-design-vue";
import type { Option as AntSelectOption } from "ant-design-vue/types/select/option";
import { VCProps, VueComponent2 } from "@antv-plus2/helper";

export interface ISelectOptionProps extends VCProps<AntSelectOption, false> {}

export const SelectOption = AntSelect.Option as unknown as VueComponent2<
  ISelectOptionProps,
  { change: any },
  {},
  {},
  typeof AntSelectOption
>;
export interface SelectOption extends InstanceType<typeof Option> {}
