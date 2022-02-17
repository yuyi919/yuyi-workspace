/* eslint-disable no-redeclare */
import type { TextArea as AntTextArea } from "ant-design-vue/types/input/textarea";
import { TypeTsxProps, VCProps } from "@antv-plus2/helper";
import { ITextAreaProps, ITextAreaEvents, ITextAreaPublicMembers } from "ant-design-vue";

declare module "ant-design-vue/types/ant-design-vue.d" {
  export interface ITextAreaProps extends VCProps<AntTextArea, false> {}
  export interface ITextAreaEvents {}
  export interface ITextAreaScopedSlots {}
  export interface ITextAreaPublicMembers {}
}

declare module "ant-design-vue/types/input/textarea.d" {
  interface TextArea extends ITextAreaPublicMembers {
    $props: TypeTsxProps<ITextAreaProps, ITextAreaEvents>;
  }
}

export { AntTextArea };
