/* eslint-disable no-useless-constructor */
import { addResizeListener, removeResizeListener } from "@yuyi919/vue-use";
import { ResolvedGridProps } from "./Props";
import { ILayout, ILayoutParams, IStyleProps, IStyle, INormalizedLayout } from "./types";
import { isEqual } from "lodash";

const isType =
  <T>(type: string | string[]) =>
  (obj: unknown): obj is T =>
    obj != null &&
    (Array.isArray(type) ? type : [type]).some((t) => getType(obj) === `[object ${t}]`);
export const getType = (obj: any) => Object.prototype.toString.call(obj);
export const isFn = isType<(...args: any[]) => any>([
  "Function",
  "AsyncFunction",
  "GeneratorFunction",
]);
export const isArr = Array.isArray;
export const isPlainObj = isType<object>("Object");
export const isStr = isType<string>("String");
export const isBool = isType<boolean>("Boolean");
export const isNum = isType<number>("Number");
export const isObj = (val: unknown): val is object => typeof val === "object";
export const isRegExp = isType<RegExp>("RegExp");
export const isValid = (val: any) => val !== undefined && val !== null;

export class GridCore implements ILayout {
  layoutParams: ILayoutParams = {} as ILayoutParams;
  styles: IStyle = {};
  props!: ResolvedGridProps;

  mutationObserver!: MutationObserver;

  constructor(props: ResolvedGridProps, private options: { prefixCls?: string } = {}) {
    // console.log(this);
    this.props = { ...props };
  }

  get layoutProps(): INormalizedLayout {
    return normalizeProps(this.props);
  }

  get className() {
    return `${this.options?.prefixCls || "form-grid"}-layout`;
  }

  nextProps(next: ResolvedGridProps) {
    if (!isEqual(next, this.props)) {
      this.props = { ...next };
      this.updateUI();
    }
  }

  mount(elm: HTMLDivElement) {
    this.elm = elm;
    addResizeListener(elm, this.updateUI);
    this.mutationObserver = new MutationObserver(this.updateUI);
    this.updateUI();
  }

  dispose() {
    removeResizeListener(this.elm, this.updateUI);
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    this.elm = null!;
  }

  elm!: HTMLDivElement;

  setLayout(layoutParams: ILayoutParams) {
    this.layoutParams = layoutParams;
  }

  setStyles(style: IStyle) {
    this.styles = style;
    // console.log("setStyles", style);
  }

  updateUI = () => {
    const params = this.calculateSmartColumns(this.elm);
    // console.log(this.layoutProps);
    this.setLayout({
      ...params,
      columnGap: this.layoutProps.columnGap,
    });
    const styles = getStyle(this.layoutProps, {
      layoutParams: params,
      elm: this.elm,
    });
    if (!isEqual(styles, this.styles)) {
      this.setStyles(styles);
    }
  };

  calculateSmartColumns = (target: HTMLElement) => {
    const { clientWidth } = target;
    const index = this.layoutProps.intervals.findIndex((interval) => {
      const [min, max] = interval;
      if (clientWidth >= min && max > clientWidth) {
        return true;
      }
    });

    const takeMaxColumns = () => {
      return (this.layoutProps.maxColumns as number[])?.[index];
    };

    const takeMinColumns = () => {
      return (this.layoutProps.minColumns as number[])?.[index] || 1;
    };

    const takeColwrap = (): boolean => {
      return (this.layoutProps.colWrap as boolean[])?.[index] || true;
    };

    const takeMinWidth = () => {
      const rMaxColumns = takeMaxColumns();
      if (isValid(this.layoutProps.minWidth)) {
        return (this.layoutProps.minWidth as number[])[index] || 0;
      } else {
        if (isValid(rMaxColumns)) {
          return Math.floor(
            (clientWidth - (rMaxColumns - 1) * this.layoutProps.columnGap!) / rMaxColumns
          );
        } else {
          return 0;
        }
      }
    };

    const takeMaxWidth = () => {
      if (isValid(this.layoutProps.maxWidth)) {
        return (this.layoutProps.maxWidth as number[])[index] || 0;
      } else {
        if (isValid((this.layoutProps.minColumns as number[])?.[index])) {
          const calculated = Math.floor(
            (clientWidth -
              ((this.layoutProps.minColumns as number[])[index] - 1) *
                this.layoutProps.columnGap!) /
              (this.layoutProps.minColumns as number[])[index]
          );
          if (Infinity === calculated) {
            return clientWidth;
          }
          return calculated;
        } else {
          return Infinity;
        }
      }
    };

    return {
      minWidth: takeMinWidth(),
      maxWidth: takeMaxWidth(),
      columns: target.childNodes.length,
      colWrap: takeColwrap(),
      minColumns: takeMinColumns(),
      maxColumns: takeMaxColumns(),
      clientWidth,
    };
  };

  getGridSpan(gridSpan = 1, params = this.layoutParams) {
    if (!isValid(params)) {
      return gridSpan;
    }
    const { colWrap, columns, clientWidth, minWidth, columnGap, maxColumns } = params;
    const calc = Math.floor((clientWidth + columnGap!) / (minWidth + columnGap)); // 算出实际一行最多能塞进的格子数
    if (colWrap === true) {
      if (Math.min(calc, columns) >= gridSpan) {
        if (isValid(maxColumns)) {
          return Math.min(gridSpan, maxColumns);
        }
        return gridSpan;
      } else {
        if (isValid(maxColumns)) {
          return Math.min(calc, gridSpan, maxColumns);
        }
        return Math.min(calc, gridSpan);
      }
    } else {
      if (Math.min(calc, columns) >= gridSpan) {
        if (isValid(maxColumns)) {
          return Math.min(gridSpan, maxColumns);
        }
        return gridSpan;
      } else {
        if (isValid(maxColumns)) {
          return Math.min(calc, columns, maxColumns);
        }
        return Math.min(calc, columns);
      }
    }
  }
}

const getStyle = (layoutProps: INormalizedLayout, styleProps: IStyleProps): IStyle => {
  const { columnGap, rowGap } = layoutProps;
  const { layoutParams, elm } = styleProps;
  // const max = layoutParams.maxWidth ? `${layoutParams.maxWidth}px` : '1fr';
  const { clientWidth, minWidth, maxColumns, minColumns } = layoutParams;
  const getMinMax = (minWidth: number, maxWidth: number) => {
    let minmax: string;
    if (minWidth === Infinity) {
      if (!isValid(maxWidth)) {
        minmax = "1fr";
      } else {
        minmax = `minmax(0px,${maxWidth}px)`;
      }
    } else {
      minmax = `minmax(${minWidth}px,${isValid(maxWidth) ? `${maxWidth}px` : "1fr"})`;
    }
    return minmax;
  };

  const spans = Array.from(elm.childNodes || []).reduce((buf, cur) => {
    const dataSpan = Number((cur as HTMLElement)?.getAttribute?.("data-span") || 1);
    const span = isValid(maxColumns) ? Math.min(dataSpan, maxColumns) : dataSpan;
    return buf + span;
  }, 0);
  // console.log("spans", elm, spans);
  const calc = Math.ceil((clientWidth + columnGap) / (minWidth + columnGap));
  let finalColumns: number;
  if (isValid(maxColumns)) {
    finalColumns = Math.min(spans, calc, maxColumns);
  } else {
    finalColumns = Math.min(spans, calc);
  }

  if (isValid(minColumns)) {
    if (finalColumns < minColumns) {
      finalColumns = minColumns;
    }
  }

  const style = {
    gridTemplateColumns: `repeat(${finalColumns}, ${getMinMax(
      layoutParams!.minWidth!,
      layoutParams!.maxWidth!
    )})`,
    gridGap: `${rowGap}px ${columnGap}px`,
  };
  return style;
};

const normalize = <T>(
  prop: T | T[] | undefined,
  intervals: [number, number][]
): T[] | undefined => {
  if (isNum(prop) || isBool(prop)) {
    return intervals.map(() => prop) as T[];
  } else if (Array.isArray(prop)) {
    let lastVal: T;
    return intervals.map((it, idx) => {
      const res = (isValid(prop[idx]) ? prop[idx] : lastVal) || 0;
      lastVal = isValid(prop[idx]) ? prop[idx] : lastVal;
      return res;
    }) as T[];
  }
};
const normalizeProps = (props: ResolvedGridProps): INormalizedLayout => {
  const { breakpoints } = props;

  const intervals: [number, number][] = breakpoints!.reduce((buf, cur, index, array) => {
    if (index === array.length - 1) {
      return [...buf, [array[index], Infinity]];
    }
    if (index === 0) {
      return [...buf, [0, cur], [cur, array[index + 1]]];
    }
    return [...buf, [cur, array[index + 1]]];
  }, [] as [number, number][]);

  return {
    ...props,
    intervals,
    colWrap: normalize(props.colWrap, intervals)!,
    minWidth: normalize(props.minWidth, intervals)!,
    maxWidth: normalize(props.maxWidth, intervals)!,
    minColumns: normalize(props.minColumns, intervals)!,
    maxColumns: normalize(props.maxColumns, intervals)!,
  };
};
