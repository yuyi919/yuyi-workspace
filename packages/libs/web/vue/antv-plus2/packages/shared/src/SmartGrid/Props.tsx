import { RequiredTo, Types } from "@yuyi919/shared-types";
import { Component, Prop } from "@antv-plus2/helper";

const SM = 720;
const MD = 1280;
const LG = 1920;

@Component({})
export class GridProps {
  /**
   * 元素最小宽度
   */
  @Prop({ type: [Number, Array], default: 100 })
  minWidth?: number | number[];
  /**
   * 元素最大宽度
   */
  @Prop({ type: [Number, Array] })
  maxWidth?: number | number[];

  /**
   * 最小列数
   */
  @Prop({ type: [Number, Array], default: 0 })
  minColumns?: number | number[];
  /**
   * 最大列数
   */
  @Prop({ type: [Number, Array] })
  maxColumns?: number | number[];

  /**
   * 自动换行
   */
  @Prop({ type: [Boolean, Array], default: true })
  colWrap?: boolean | boolean[];

  /**
   * 容器尺寸断点
   */
  @Prop({ type: Array, default: () => [SM, MD, LG] })
  breakpoints?: [number, number, number];

  /**
   * 列间距
   */
  @Prop({ type: Number, default: 10 })
  columnGap?: number;

  /**
   * 行间距
   */
  @Prop({ type: Number, default: 5 })
  rowGap?: number;
}
export type ResolvedGridProps = Types.Type<
  RequiredTo<
    GridProps,
    "minWidth" | "minColumns" | "colWrap" | "breakpoints" | "columnGap" | "rowGap"
  >
>;
export default GridProps;
