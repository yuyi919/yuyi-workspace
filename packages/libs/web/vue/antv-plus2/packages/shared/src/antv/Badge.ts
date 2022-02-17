/* eslint-disable no-redeclare */
import { Badge as AntBadge } from "ant-design-vue";
import { VCProps, VueComponent2 } from "@antv-plus2/helper";

export interface IBadgeProps extends VCProps<AntBadge, false> {}
export interface IBadgeEvents {
  change: any;
  click: MouseEvent;
}
export interface IBadgeScopedSlots {}
export interface IBadgePublicMembers {}

export const Badge = AntBadge as VueComponent2<
  IBadgeProps,
  IBadgeEvents,
  IBadgeScopedSlots,
  IBadgePublicMembers,
  typeof AntBadge
>;
export interface Badge extends InstanceType<typeof Badge> {}

export { AntBadge };
