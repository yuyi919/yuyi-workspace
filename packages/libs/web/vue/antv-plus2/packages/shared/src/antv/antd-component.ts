/* eslint-disable no-redeclare */
// @ts-nocheck
import type { AntdComponent as AntAntdComponent } from "ant-design-vue/types/component";
import { VCProps, VueComponent2 } from "@antv-plus2/helper";

export interface IAntdComponentProps extends VCProps<AntAntdComponent, false> {}
export interface IAntdComponentEvents {}
export interface IAntdComponentScopedSlots {}
export interface IAntdComponentPublicMembers {}

export const AntdComponent = AntAntdComponent as unknown as VueComponent2<
  IAntdComponentProps,
  IAntdComponentEvents,
  IAntdComponentScopedSlots,
  IAntdComponentPublicMembers,
  typeof AntAntdComponent
>;
export interface AntdComponent extends InstanceType<typeof AntdComponent> {}

export { AntAntdComponent };
