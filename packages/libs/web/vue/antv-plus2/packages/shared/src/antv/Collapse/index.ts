/* eslint-disable no-redeclare */
import { VCProps, VueComponent2 } from "@antv-plus2/helper";
import { Collapse as AntCollapse } from "ant-design-vue";

export interface ICollapseProps extends VCProps<AntCollapse, false> {}

export interface ICollapseEvents {}
export interface ICollapseScopedSlots {}
export interface ICollapsePublic {}

export const Collapse = AntCollapse as unknown as VueComponent2<
  ICollapseProps,
  ICollapseEvents,
  ICollapseScopedSlots,
  ICollapsePublic,
  typeof AntCollapse
>;
export interface Collapse extends InstanceType<typeof Collapse> {}

export { AntCollapse };

export interface ICollapsePanelProps
  // eslint-disable-next-line no-use-before-define
  extends VCProps<import("ant-design-vue/types/collapse/collapse-panel").CollapsePanel, false> {}

export interface ICollapsePanelEvents {}
export interface ICollapsePanelScopedSlots {}
export interface ICollapsePanelPublic {}
export const CollapsePanel = AntCollapse.Panel as unknown as VueComponent2<
  ICollapsePanelProps,
  ICollapsePanelEvents,
  ICollapsePanelScopedSlots,
  ICollapsePanelPublic,
  typeof AntCollapse.Panel
>;
export interface CollapsePanel extends InstanceType<typeof CollapsePanel> {}
export const AntCollapsePanel = AntCollapse.Panel;
