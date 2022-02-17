import { Component, Prop, PropTypes } from "@antv-plus2/helper";

@Component()
export class DialogProps {
  @Prop(PropTypes.looseBool)
  keyboard?: boolean;

  @Prop(PropTypes.looseBool)
  mask?: boolean;

  @Prop(PropTypes.func)
  afterClose?: () => any;

  @Prop(PropTypes.looseBool)
  closable?: boolean;

  @Prop(PropTypes.looseBool)
  maskClosable?: boolean;

  @Prop(PropTypes.looseBool)
  visible?: boolean;

  @Prop(PropTypes.looseBool)
  destroyOnClose?: boolean;

  @Prop(
    PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }).loose
  )
  mousePosition?: { x?: number; y?: number };

  @Prop(PropTypes.any)
  title?: any;

  @Prop(PropTypes.any)
  footer?: any;

  @Prop(PropTypes.string)
  transitionName?: string;

  @Prop(PropTypes.string)
  maskTransitionName?: string;

  @Prop(PropTypes.any)
  animation?: any;

  @Prop(PropTypes.any)
  maskAnimation?: any;

  @Prop(PropTypes.object)
  wrapStyle?: any;

  @Prop(PropTypes.object)
  bodyStyle?: any;

  @Prop(PropTypes.object)
  maskStyle?: any;

  @Prop(PropTypes.string)
  prefixCls?: string;

  @Prop(PropTypes.string)
  wrapClassName?: string;

  @Prop(PropTypes.shapeSize)
  width?: any;

  @Prop(PropTypes.shapeSize)
  height?: any;

  @Prop(PropTypes.number)
  zIndex?: number;

  @Prop(PropTypes.any)
  bodyProps?: any;

  @Prop(PropTypes.any)
  maskProps?: any;

  @Prop(PropTypes.any)
  wrapProps?: any;

  @Prop(PropTypes.oneOf([PropTypes.bool, PropTypes.func]))
  getContainer?: any;

  @Prop(PropTypes.object)
  dialogStyle?: any;

  @Prop(PropTypes.string)
  dialogClass?: string;

  @Prop(PropTypes.any)
  closeIcon?: any;

  @Prop(PropTypes.looseBool)
  forceRender?: boolean;

  @Prop(PropTypes.func)
  getOpenCount?: () => number | null | undefined;

  @Prop(PropTypes.looseBool)
  focusTriggerAfterClose?: boolean;

  @Prop(PropTypes.func)
  onClose?: any;

  @Prop()
  switchScrollingEffect?: any;
}
