/* eslint-disable no-redeclare */
// @ts-nocheck
import { Col as AntCol } from "ant-design-vue";
import { TypeTsxProps, VCProps } from "@antv-plus2/helper";

declare module "ant-design-vue/types/ant-design-vue.d" {
  export interface IColProps extends VCProps<AntCol, false> {}
  export interface IColEvents {
    change: boolean;
  }
  export interface IColScopedSlots {}
  export interface IColPublicMembers {}
  interface Col extends IPopoverPublicMembers {
    $props: TypeTsxProps<IColProps, IColEvents>;
  }
}

export { AntCol };
