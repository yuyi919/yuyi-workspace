/* eslint-disable no-redeclare */
import { Select as AntSelect } from "ant-design-vue";
import { VCProps, VueComponent2, getPropsClass } from "@antv-plus2/helper";
import { SelectOption } from "./Option";
import { SelectOptionGroup } from "./OptGroup";
import { CSSProperties } from "@yuyi919/shared-types";

export interface ISelectProps extends Omit<VCProps<AntSelect, false>, "blur" | "focus"> {
  dropdownStyle?: CSSProperties;
}

export interface ISelectEvents {
  change(value: any, option: any): void;
  /**
   * 失去焦点的时回调
   */
  blur: any;
  focus: any;
  search: undefined | string;
  dropdownVisibleChange: boolean;
  inputKeydown: KeyboardEvent;
  popupScroll: any;
  mouseenter: any;
  mouseleave: any;
  select(value: any, option: any): void;
  deselect(value: any, option: any): void;
}
export interface ISelectScopedSlots {}
export interface ISelectPublic extends Pick<AntSelect, "blur" | "focus"> {}
export const Select = AntSelect as unknown as VueComponent2<
  ISelectProps,
  ISelectEvents,
  ISelectScopedSlots,
  ISelectPublic,
  typeof AntSelect & {
    Option: typeof SelectOption;
    OptGroup: typeof SelectOptionGroup;
  }
>;
export interface Select extends InstanceType<typeof Select> {}
export const AntSelectProps = getPropsClass(AntSelect);

export { AntSelect };

export * from "./Option";
export * from "./OptGroup";
