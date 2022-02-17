/* eslint-disable no-redeclare */
// @ts-nocheck
import { Upload as AntUpload } from "ant-design-vue";
import { VCProps, VueComponent2 } from "@antv-plus2/helper";

export type FileLoader = AntUpload["fileList"][number];
export interface IUploadProps extends VCProps<AntUpload, false> {
  previewFile?: (file: FileLoader) => Promise<string>;
}
export interface IUploadEvents {
  change: {
    file: FileLoader;
    fileList: FileLoader[];
    event?: any;
  };
  preview: (file: FileLoader) => any;
}
export interface IUploadScopedSlots {}
export interface IUploadPublicMembers {}

export const Upload = AntUpload as unknown as VueComponent2<
  IUploadProps,
  IUploadEvents,
  IUploadScopedSlots,
  IUploadPublicMembers,
  typeof AntUpload
>;
export interface Upload extends InstanceType<typeof Upload> {}

export { AntUpload };
