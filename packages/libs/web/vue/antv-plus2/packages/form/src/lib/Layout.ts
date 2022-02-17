import { Component, Prop } from "@antv-plus2/helper";

@Component()
export class LayoutItemProps {
  @Prop({ type: String })
  layout?: "vertical" | "horizontal" | "inline";

  /**
   * 标签带冒号后缀
   */
  @Prop({ type: Boolean, default: true })
  colon?: boolean;

  /**
   * @default 根据formLayout判断 props.layout === "vertical" ? "left" : "right"
   */
  @Prop({ type: String })
  labelAlign?: "left" | "right";

  /**
   * 默认根据布局自适应
   */
  @Prop({ type: String, default: "left" })
  wrapperAlign?: "left" | "right";

  @Prop({ type: Boolean })
  labelWrap?: boolean;

  @Prop({ type: [Number, String] })
  labelWidth?: number | "auto";

  @Prop({ type: [Number, String] })
  wrapperWidth?: number | "auto";

  @Prop({ type: Boolean })
  wrapperWrap?: boolean;

  @Prop()
  labelCol?: number;

  @Prop()
  wrapperCol?: number;

  /**
   * 启用栅格模式, 如果为false将会无视labelCol和wrapperCol
   * 默认根据是否传入labelCol或wrapperCol判断，也可以手动传入强制控制
   */
  @Prop(Boolean)
  enableCol?: boolean;

  @Prop({ type: Boolean })
  fullness?: boolean;

  @Prop({ type: String, default: "default" })
  size?: "small" | "default" | "large";

  @Prop({ type: Boolean })
  inset?: boolean;

  @Prop({ type: String, default: "icon" })
  tooltipLayout?: "icon" | "text";

  @Prop({ type: String, default: "loose" })
  feedbackLayout?: "loose" | "terse" | "popover" | "none";

  @Prop({ type: Boolean, default: true })
  bordered?: boolean;

  /**
   * 组件容器样式
   */
  @Prop(Number)
  gridSpan?: number;
}

@Component()
export class LayoutProps extends LayoutItemProps {
  @Prop({ type: String, default: "horizontal" })
  layout?: "vertical" | "horizontal" | "inline";

  @Prop({ default: "ltr" })
  direction?: "rtl" | "ltr";

  @Prop({ type: Boolean, default: true })
  shallow?: boolean;
}
