/* eslint-disable no-redeclare */
import type { InputSearch as AntInputSearch } from "ant-design-vue/types/input/input-search";
import { TypeTsxProps, VCProps } from "@antv-plus2/helper";
import { IInputSearchProps, IInputSearchEvents, IInputSearchPublicMembers } from "ant-design-vue";

declare module "ant-design-vue" {
  export interface IInputSearchProps extends VCProps<AntInputSearch, false> {}
  export interface IInputSearchEvents {}
  export interface IInputSearchScopedSlots {}
  export interface IInputSearchPublicMembers {}
}

declare module "ant-design-vue/types/input/input-search.d" {
  interface InputSearch extends IInputSearchPublicMembers {
    $props: TypeTsxProps<IInputSearchProps, IInputSearchEvents>;
  }
}

export { AntInputSearch };
