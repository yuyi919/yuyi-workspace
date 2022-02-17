import { CSSProperties } from "@yuyi919/shared-types";
import { Component, Prop, PropsMixins } from "@antv-plus2/helper";
import { ClassesProps } from "./styles";

export type NormalizeModalPlacement = "top" | "bottom" | "left" | "right" | "center";

@Component({})
export class NormalizeModalProps extends PropsMixins(ClassesProps) {
  /**
   * 是否显示右上角的关闭按钮
   * @default true
   */
  @Prop({ type: Boolean, default: true })
  closable?: boolean;

  /**
   * 关闭时销毁 Drawer 里的子元素
   * @default true
   */
  @Prop({ type: Boolean, default: true })
  destroyOnClose?: boolean;

  /**
   * 指定 Drawer 挂载的 HTML 节点
   * @default () => document.body
   */
  @Prop([Function, Object])
  getContainer?: (element?: HTMLElement) => HTMLElement;

  /**
   * 点击蒙层是否允许关闭
   * @default true
   */
  @Prop({ type: Boolean, default: true })
  maskClosable?: boolean;

  /**
   * 是否展示遮罩
   * @default true
   */
  @Prop({ type: Boolean, default: true })
  mask?: boolean;

  /**
   * 遮罩样式
   */
  @Prop([String, Object])
  maskStyle?: string | Partial<CSSProperties>;

  /**
   * 设置z-index
   * @default 1030
   */
  @Prop({ type: Number, default: 1030 })
  zIndex?: number;

  /**
   * 是否支持键盘 esc 关闭
   * @default true
   */
  @Prop(Boolean)
  keyboard?: boolean;

  /**
   * 是否可见
   */
  @Prop(Boolean)
  visible?: boolean;

  /**
   * 标题
   * @slot
   */
  @Prop()
  title?: any;

  /**
   * 关闭(动画)结束后的回调
   */
  @Prop(Function)
  afterClose?: () => void;

  /**
   * 标题
   */
  @Prop()
  footer?: any;

  /**
   * 模态框宽度，在placement为 top 或 bottom 时视作高度
   * @default "auto"
   */
  @Prop({ type: [String, Number], default: "auto" })
  width?: string | number;

  /**
   * 展示位置
   * @default undefined
   */
  @Prop({ type: String, default: "default" })
  placement?: null | "default" | NormalizeModalPlacement;

  /**
   * 展示过渡效果
   * @default "zoom"
   */
  @Prop({ type: String, default: "zoom" })
  transitionType?: "fade" | "zoom" | "slide-fade" | "slide-zoom";

  /**
   * 过渡效果的持续时间, 毫秒(ms)单位
   * @default 200
   */
  @Prop({ type: Number, default: 200 })
  transitionDuration?: number;

  /**
   * 是否用分割线分割footer和body
   * @default true
   */
  @Prop({ type: Boolean, default: true })
  footerBorder?: boolean;

  @Prop({ type: Object })
  parentModal?: {
    getInnerModal(): any;
  };
}

export type { NormalizeModalProps as INormalizeModalProps };
