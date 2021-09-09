import Types from "@yuyi919/shared-types";
import { CSSProperties } from "./createStyled";
import { Breakpoint, BreakPointRecord, Breakpoints } from "./createTheme";
import { merge } from "./merge";
import { StyleFunction } from "./types";
import { deepmerge } from "./utils";

// The breakpoint **start** at this value.
// For instance with the first breakpoint xs: [xs, sm[.
const values: BreakPointRecord = {
  xs: 0, // phone
  sm: 600, // tablets
  md: 900, // small laptop
  lg: 1200, // desktop
  xl: 1536, // large screens
};

const defaultBreakpoints: Pick<Breakpoints, "keys" | "up"> = {
  // Sorted ASC by size. That's important.
  // It can't be configured as it's used statically for propTypes.
  keys: ["xs", "sm", "md", "lg", "xl"],
  up: (key) => `@media (min-width:${key in values ? values[key as Breakpoint] : key}px)`,
};

export function handleBreakpoints<Props extends Record<string, any>>(
  props: Props,
  propValue: Record<string, string>,
  styleFromPropValue: (value: string, breakpoint?: string) => Types.Recordable
) {
  const theme = props.theme || {};

  if (Array.isArray(propValue)) {
    const themeBreakpoints = theme.breakpoints || defaultBreakpoints;
    return propValue.reduce((acc, item, index) => {
      acc[themeBreakpoints.up(themeBreakpoints.keys[index])] = styleFromPropValue(propValue[index]);
      return acc;
    }, {} as Record<string, any>);
  }

  if (typeof propValue === "object") {
    const themeBreakpoints = theme.breakpoints || defaultBreakpoints;
    return Object.keys(propValue).reduce((acc, breakpoint) => {
      // key is breakpoint
      if (Object.keys(themeBreakpoints.values || values).indexOf(breakpoint) !== -1) {
        const mediaKey = themeBreakpoints.up(breakpoint);
        acc[mediaKey] = styleFromPropValue(propValue[breakpoint], breakpoint);
      } else {
        const cssKey = breakpoint;
        acc[cssKey] = propValue[cssKey];
      }
      return acc;
    }, {} as Record<string, any>);
  }

  const output = styleFromPropValue(propValue);
  return output;
}

export function breakpoints<Props extends Types.Recordable & { theme: any }>(
  styleFunction: StyleFunction<Props>
) {
  const newStyleFunction = (
    props: {
      [K in Breakpoint]?: Omit<Props, "theme">;
    } &
      Props
  ) => {
    const theme = props.theme || {};
    const base = styleFunction(props);
    const themeBreakpoints: Pick<Breakpoints, "keys" | "up"> =
      theme.breakpoints || defaultBreakpoints;

    const extended = themeBreakpoints.keys?.reduce((acc, key) => {
      if (props[key]) {
        const next = { theme, ...(props[key] || {}) } as Props;
        acc[themeBreakpoints.up(key)] = styleFunction(next as Props);
      }
      return acc;
    }, {} as Record<string, any>);

    return merge(base, extended) as Record<string, Omit<Props, "theme">> & Omit<Props, "theme">;
  };

  // newStyleFunction.propTypes =
  //   process.env.NODE_ENV !== "production"
  //     ? {
  //         ...styleFunction.propTypes,
  //         xs: PropTypes.object,
  //         sm: PropTypes.object,
  //         md: PropTypes.object,
  //         lg: PropTypes.object,
  //         xl: PropTypes.object,
  //       }
  //     : {};

  //@ts-ignore
  newStyleFunction.filterProps = ["xs", "sm", "md", "lg", "xl", ...styleFunction?.filterProps];

  return newStyleFunction;
}

export function createEmptyBreakpointObject(breakpointsInput: Breakpoints = {} as Breakpoints) {
  const breakpointsInOrder = breakpointsInput?.keys?.reduce((acc, key) => {
    const breakpointStyleKey = breakpointsInput.up(key);
    acc[breakpointStyleKey] = {};
    return acc;
  }, {} as Record<string, CSSProperties>);
  return breakpointsInOrder || {};
}

export function removeUnusedBreakpoints(
  breakpointKeys: Breakpoint[],
  style: Record<string, CSSProperties>
) {
  return breakpointKeys.reduce((acc, key) => {
    const breakpointOutput = acc[key];
    const isBreakpointUnused = Object.keys(breakpointOutput).length === 0;
    if (isBreakpointUnused) {
      delete acc[key];
    }
    return acc;
  }, style);
}

export function mergeBreakpointsInOrder(
  breakpointsInput?: Breakpoints,
  ...styles: Record<string, CSSProperties>[]
) {
  const emptyBreakpoints = createEmptyBreakpointObject(breakpointsInput);
  const mergedOutput = [emptyBreakpoints, ...styles].reduce(
    (prev, next) => deepmerge(prev, next),
    {} as Record<string, CSSProperties>
  );
  return removeUnusedBreakpoints(Object.keys(emptyBreakpoints) as Breakpoint[], mergedOutput);
}

export default breakpoints;
