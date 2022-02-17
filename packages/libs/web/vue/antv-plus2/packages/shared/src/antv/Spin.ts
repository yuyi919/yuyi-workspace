/* eslint-disable no-redeclare */
// @ts-nocheck
import { Spin as AntSpin } from "ant-design-vue";
import { VCProps, VueComponent2 } from "@antv-plus2/helper";

export interface ISpinProps extends VCProps<AntSpin, false> {}
export interface ISpinEvents {
  change: boolean;
}
export interface ISpinScopedSlots {}
export interface ISpinPublicMembers {}

export const Spin = AntSpin as unknown as VueComponent2<
  ISpinProps,
  ISpinEvents,
  ISpinScopedSlots,
  ISpinPublicMembers,
  typeof AntSpin
>;
export interface Spin extends InstanceType<typeof Spin> {}

export { AntSpin };
