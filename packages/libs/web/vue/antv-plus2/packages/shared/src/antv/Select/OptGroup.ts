/* eslint-disable no-redeclare */
import { Select as AntSelect } from "ant-design-vue";
import type { OptionGroup as AntSelectOptionGroup } from "ant-design-vue/types/select/option-group";
import { VCProps, VueComponent2 } from "@antv-plus2/helper";

export interface ISelectOptionGroupProps extends VCProps<AntSelectOptionGroup, false> {}

export const SelectOptionGroup = AntSelect.OptGroup as unknown as VueComponent2<
  ISelectOptionGroupProps,
  { change: any },
  {},
  {},
  typeof AntSelectOptionGroup
>;
export interface SelectOptionGroup extends InstanceType<typeof SelectOptionGroup> {}
