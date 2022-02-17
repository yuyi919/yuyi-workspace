import { LayoutProps } from "./Layout";
import { Component, Prop } from "@antv-plus2/helper";

@Component()
export class FormLayoutProps extends LayoutProps {
  @Prop()
  prefixCls?: string;
}
