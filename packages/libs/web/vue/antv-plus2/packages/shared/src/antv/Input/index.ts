import { Input, IInputPublicMembers, IInputProps, IInputEvents } from "ant-design-vue";
import { TypeTsxProps, VCProps } from "@antv-plus2/helper";

declare module "ant-design-vue/types/ant-design-vue.d" {
  export interface IInputProps extends Omit<VCProps<Input, false>, "blur" | "focus"> {
    /**
     * 占位符
     * @default ""
     */
    placeholder?: string;
    lazy?: boolean;
    /**
     * 只读状态
     */
    readOnly?: boolean;
  }

  export interface IInputEvents {
    change: MouseEvent;
    ["change.value"]: string | undefined;
  }
  export interface IInputScopedSlots {}
  export interface IInputPublicMembers {}
}

declare module "ant-design-vue/types/input/input.d" {
  interface Input extends IInputPublicMembers {
    $props: TypeTsxProps<IInputProps, IInputEvents>;
  }
}

export { Input };
export * from "./group";
export * from "./password";
export * from "./search";
export * from "./textarea";
