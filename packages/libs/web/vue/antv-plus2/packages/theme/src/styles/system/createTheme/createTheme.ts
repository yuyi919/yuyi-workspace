import { Types } from "@yuyi919/shared-types";
import { deepmerge } from "../utils";
import { Breakpoints, BreakpointsOptions, createBreakpoints } from "./createBreakpoints";
import { createSpacing, Spacing, SpacingOptions } from "./createSpacing";
import { Shape, shape, ShapeOptions } from "./shape";

export type { Breakpoint, BreakpointOverrides } from "./createBreakpoints";

export type Direction = "ltr" | "rtl";

export interface IBasePalette {
  mode: "light" | "dark";
}
export interface BaseThemeOptions {
  shape?: ShapeOptions;
  breakpoints?: BreakpointsOptions;
  direction?: Direction;
  palette?: Partial<IBasePalette>;
  spacing?: SpacingOptions;
  zIndex?: Types.Recordable<number | undefined | null>;
}
export interface BaseTheme {
  shape: Shape;
  breakpoints: Breakpoints;
  direction: Direction;
  palette: IBasePalette;
  spacing: Spacing;
}

/**
 * Generate a theme base on the options received.
 * @param options Takes an incomplete theme object and adds the missing parts.
 * @param args Deep merge the arguments with the about to be returned theme.
 * @returns A complete, ready to use theme object.
 */
export function createBaseTheme(options?: BaseThemeOptions, ...args: object[]): BaseTheme {
  const {
    breakpoints: breakpointsInput = {},
    palette: paletteInput = {},
    spacing: spacingInput,
    shape: shapeInput = {},
    ...other
  } = options || {};

  const breakpoints = createBreakpoints(breakpointsInput);
  const spacing = createSpacing(spacingInput);

  let muiTheme = deepmerge(
    {
      breakpoints,
      direction: "ltr",
      palette: { mode: "light", ...paletteInput },
      spacing,
      shape: { ...shape, ...shapeInput },
    },
    other
  ) as BaseTheme;

  muiTheme = args.reduce((acc: BaseTheme, argument) => deepmerge(acc, argument), muiTheme);

  return muiTheme;
}
