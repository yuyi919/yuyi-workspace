/* eslint-disable no-redeclare */
import { Row as AntRow } from "ant-design-vue";
import { TypeTsxProps, VCProps } from "@antv-plus2/helper";

declare module "ant-design-vue/types/ant-design-vue.d" {
  export interface IRowProps extends VCProps<AntRow, false> {}
  export interface IRowEvents {
    change: boolean;
  }
  export interface IRowScopedSlots {}
  export interface IRowPublicMembers {}
  interface Row extends IPopoverPublicMembers {
    $props: TypeTsxProps<IRowProps, IRowEvents>;
  }
}

export { AntRow };
