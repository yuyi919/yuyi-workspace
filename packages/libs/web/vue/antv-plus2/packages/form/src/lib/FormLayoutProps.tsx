import { LayoutProps } from "./Layout";
import { Component, Prop } from "@yuyi919/vue-antv-plus2-helper";

@Component()
export class FormLayoutProps extends LayoutProps {
  @Prop()
  prefixCls?: string;
}
