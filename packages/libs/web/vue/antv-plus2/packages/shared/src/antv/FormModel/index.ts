/* eslint-disable no-redeclare */
// @ts-nocheck
import { FormModel as AntFormModel } from "ant-design-vue";
import { VCProps, VueComponent2 } from "@antv-plus2/helper";
import { IColProps } from "../Grid";

export interface IFormModelItemProps
  extends Omit<
    VCProps<InstanceType<typeof AntFormModel["Item"]>, false>,
    "labelCol" | "wrapperCol"
  > {
  labelCol: IColProps;
  wrapperCol: IColProps;
}
export interface IFormModelProps
  extends Omit<VCProps<AntFormModel, false>, "labelCol" | "wrapperCol"> {
  labelCol: IColProps;
  wrapperCol: IColProps;
}
export interface IFormModelEvents {
  change: boolean;
}
export interface IFormModelScopedSlots {}
export interface IFormModelPublicMembers {}

export const FormModel = AntFormModel as unknown as VueComponent2<
  IFormModelProps,
  IFormModelEvents,
  IFormModelScopedSlots,
  IFormModelPublicMembers,
  typeof AntFormModel
>;
export interface FormModel extends InstanceType<typeof FormModel> {}

export { AntFormModel };
