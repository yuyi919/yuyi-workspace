/* eslint-disable no-redeclare */
import { Drawer as AntDrawer } from "ant-design-vue";
import { getPropsClass, VCProps, TypeTsxProps } from "@antv-plus2/helper";

declare module "ant-design-vue/types/ant-design-vue.d" {
  export interface IDrawerProps extends VCProps<Omit<AntDrawer, "maskStyle">, false> {
    maskStyle?: any;
  }
  export interface IDrawerEvents {
    close: Event;
  }
  export interface IDrawerScopedSlots {}
  export interface IDrawerPublicMembers {}
  export interface Drawer extends IDrawerPublicMembers {
    $props: TypeTsxProps<IDrawerProps, IDrawerEvents>;
  }
}

export const DrawerProps = getPropsClass(
  AntDrawer,
  {
    destroyOnClose: true,
  },
  "maskClosable"
);

export { AntDrawer };
