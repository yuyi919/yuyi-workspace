import { CSSProperties } from "@yuyi919/shared-types";
import { Prop, Component, VCProps, PropProvider } from "@antv-plus2/helper";

@Component({})
export class ScrollBarProps extends PropProvider<ScrollBarProps> {
  @Prop({ type: String, default: "" })
  className?: string;

  @Prop(Boolean)
  native?: boolean;

  @Prop(null)
  wrapStyle?: string | CSSProperties | CSSProperties[];

  @Prop(null)
  wrapClass?: string | object | (string | object)[];

  @Prop(null)
  viewClass?: string | object | (string | object)[];

  @Prop(null)
  viewStyle?: string | CSSProperties | CSSProperties[];

  /**
   * 如果 container 尺寸[永远]不会发生变化，设置它可以优化性能
   */
  @Prop(Boolean)
  noResize?: boolean; //

  @Prop({
    type: String,
    default: "div",
  })
  tag?: string;

  /**
   * 强制隐藏原始滚动条
   */
  @Prop({
    type: Boolean,
  })
  hidden?: boolean;

  /**
   * 容器固定宽度
   */
  @Prop([Number, String])
  width?: number | string;

  /**
   * 容器固定高度
   */
  @Prop([Number, String])
  height?: number | string;

  /**
   * 容器最大高度
   */
  @Prop(Number)
  maxHeight?: number;

  /**
   * 容器最大宽度
   */
  @Prop(Number)
  maxWidth?: number;

  @Prop({
    type: Number,
    default: 0,
  })
  delay?: number;

  @Prop({
    type: Number,
    default: 0,
  })
  listenerDelay?: number;

  @Prop({
    type: Number,
    default: 9,
  })
  thumbSize?: number;

  @Prop({
    type: Boolean,
    default: false,
  })
  noPadding?: boolean;

  @Prop(Function)
  wrapRef?: (e?: HTMLDivElement | null) => void;

  @Prop(String)
  debug?: string;

  @Prop(Boolean)
  disabled?: boolean;
}

export interface IScrollBarProps extends VCProps<ScrollBarProps> {}
export default ScrollBarProps;
