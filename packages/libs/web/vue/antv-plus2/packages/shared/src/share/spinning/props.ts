import { Component, Prop, PropProvider } from "@antv-plus2/helper";

@Component({})
export class SpinningProps extends PropProvider<SpinningProps> {
  /**
   * 展示加载中标志
   * @displayName spinning
   * @model .sync
   */
  @Prop({ type: Boolean, default: false })
  public spinning?: boolean;
}
