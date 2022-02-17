/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-interface */

import { Types } from "@yuyi919/shared-types";
import { Component, getPropsClass, Prop } from "@antv-plus2/helper";
import { Button, IButtonProps } from "ant-design-vue";

@Component({})
export class ButtonProps extends getPropsClass(Button, {}, "type") {
  /**
   * 仅适用link-button；字体颜色继承上级元素，停用下划线
   **/
  @Prop({ type: Boolean })
  colorInherit?: boolean;

  /**
   * 提示信息
   */
  @Prop({ type: String })
  hint?: string;

  /**
   * 提示信息标题
   */
  @Prop({ type: String })
  hintTitle?: string;

  /**
   * 在ant button基础上新增第二主色
   * @default 'default'
   **/
  @Prop({ type: String, default: "default" })
  type?: IButtonProps["type"] | "second" | "link" | Types.DynamicString; //  (string & {});
}

export default ButtonProps;
