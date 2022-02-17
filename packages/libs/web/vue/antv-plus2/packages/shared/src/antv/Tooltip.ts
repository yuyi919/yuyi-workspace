/* eslint-disable no-redeclare */
// @ts-nocheck
import { Tooltip as AntTooltip } from "ant-design-vue";
import { getPropsClass, VCProps, VueComponent2 } from "@antv-plus2/helper";

export interface ITooltipProps extends VCProps<AntTooltip, false> {}
export interface ITooltipEvents {}
export interface ITooltipScopedSlots {}
export interface ITooltipPublicMembers {}

export const Tooltip = AntTooltip as unknown as VueComponent2<
  ITooltipProps,
  ITooltipEvents,
  ITooltipScopedSlots,
  ITooltipPublicMembers,
  typeof AntTooltip
>;
export interface Tooltip extends InstanceType<typeof Tooltip> {}

export { AntTooltip };

export const AntTooltipProps = getPropsClass(AntTooltip);
