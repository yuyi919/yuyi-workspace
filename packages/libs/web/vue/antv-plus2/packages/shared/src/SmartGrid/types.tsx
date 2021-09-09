import { Types } from "@yuyi919/shared-types";

export interface ILayout {
  elm: HTMLDivElement;
  className: string;
  layoutParams: ILayoutParams;
  layoutProps: INormalizedLayout;
  styles: Types.CSSProperties;
}
export interface INormalizedLayout {
  intervals: [number, number][];
  colWrap: boolean[];
  minWidth: number[];
  maxWidth: number[];
  minColumns: number[];
  maxColumns: number[];
  columnGap: number;
  rowGap: number;
}
export interface ILayoutParams {
  minWidth: number;
  maxWidth: number;
  columns: number;
  colWrap: boolean;
  minColumns: number;
  maxColumns: number;
  clientWidth: number;
  columnGap: number;
}

export interface IStyle {
  [key: string]: string;
}
export interface IStyleProps {
  layoutParams: {
    minWidth: number;
    columns: number;
    colWrap: boolean;
    maxWidth: number;
    clientWidth: number;
    maxColumns: number;
    minColumns: number;
  };
  elm: HTMLElement;
}

export interface IGridColumnProps {
  gridSpan: number;
}
