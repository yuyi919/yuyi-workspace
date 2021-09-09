import { OverridableStringUnion } from "../types";

export interface BreakpointOverrides {
  mobile: true;
  tablet: true;
  laptop: true;
  desktop: true;
}

export type BreakpointCore = "xs" | "sm" | "md" | "lg" | "xl";
export type Breakpoint = OverridableStringUnion<BreakpointCore, BreakpointOverrides>;
export const keys: Breakpoint[] = ["xs", "sm", "md", "lg", "xl"];

export type BreakPointRecord = {
  [key in BreakpointCore]: number;
} &
  { [key in Exclude<Breakpoint, BreakpointCore>]?: number };

export interface Breakpoints {
  /**
   * @internal
   */
  unit: string;
  keys: Breakpoint[];
  values: BreakPointRecord;
  up: (key: Breakpoint | number) => string;
  down: (key: Breakpoint | number) => string;
  between: (start: Breakpoint | number, end: Breakpoint | number) => string;
  only: (key: Breakpoint) => string;
}
const defaultBreakPoint = {
  xs: 0, // phone
  sm: 600, // tablets
  md: 900, // small laptop
  lg: 1200, // desktop
  xl: 1536, // large screens
} as BreakPointRecord;
export type BreakpointsOptions = Partial<
  {
    unit: string;
    step: number;
  } & Omit<Breakpoints, "values">
> & {
  values?: Partial<BreakPointRecord>;
};

export function setupBreakpoints(values?: Partial<BreakPointRecord>): BreakPointRecord {
  if (!values) return defaultBreakPoint;
  const result = { ...values } as BreakPointRecord;
  for (const key in values) {
    result[key as Breakpoint] ??= defaultBreakPoint[key as Breakpoint]!;
  }
  return result;
}

export function createBreakpoints(options: BreakpointsOptions): Breakpoints {
  const {
    // The breakpoint **start** at this value.
    // For instance with the first breakpoint xs: [xs, sm).
    values: source,
    unit = "px",
    step = 5,
    ...other
  } = options as BreakpointsOptions;
  const values = setupBreakpoints(source);
  const keys = Object.keys(values) as Breakpoint[];

  function up(key: Breakpoint | number) {
    const value = (
      typeof values[key as Breakpoint] === "number" ? values[key as Breakpoint] : key
    ) as number;
    return `@media (min-width:${value}${unit})`;
  }

  function down(key: Breakpoint | number) {
    const value = (
      typeof values[key as Breakpoint] === "number" ? values[key as Breakpoint] : key
    ) as number;
    return `@media (max-width:${value - step / 100}${unit})`;
  }

  function between(start: Breakpoint | number, end: Breakpoint | number) {
    const endIndex = keys.indexOf(end as Breakpoint);

    return (
      `@media (min-width:${
        typeof values[start as Breakpoint] === "number" ? values[start as Breakpoint] : start
      }${unit}) and ` +
      `(max-width:${
        ((endIndex !== -1 && typeof values[keys[endIndex] as Breakpoint] === "number"
          ? values[keys[endIndex] as Breakpoint]
          : end) as number) -
        step / 100
      }${unit})`
    );
  }

  function only(key: Breakpoint) {
    if (keys.indexOf(key) + 1 < keys.length) {
      return between(key, keys[keys.indexOf(key) + 1]);
    }

    return up(key);
  }

  return {
    keys,
    values: values as BreakPointRecord,
    up,
    down,
    between,
    only,
    unit,
    ...other,
  };
}
