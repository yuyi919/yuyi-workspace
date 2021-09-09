export {
  createTheme,
  createMuiStrictModeTheme as unstable_createMuiStrictModeTheme,
  createMuiTheme,
} from "./createTheme";
export type { ThemeOptions, Theme } from "./createTheme";
// export { adaptV4Theme, DeprecatedThemeOptions } from "./adaptV4Theme";
export type {
  Palette,
  PaletteColor,
  PaletteColorOptions,
  PaletteOptions,
  SimplePaletteColorOptions,
} from "./createPalette";
// export { default as createStyles } from "./createStyles";
export type {
  Typography as TypographyVariants,
  TypographyOptions as TypographyVariantsOptions,
  TypographyStyle,
  Variant as TypographyVariant,
} from "./createTypography";
export { default as responsiveFontSizes } from "./responsiveFontSizes";
export type { ComponentsPropsList } from "./props";
export { duration, easing } from "./createTransitions";
export type { Duration, Easing, Transitions, TransitionsOptions } from "./createTransitions";
export {
  // color manipulators
  hexToRgb,
  rgbToHex,
  hslToRgb,
  decomposeColor,
  recomposeColor,
  getContrastRatio,
  getLuminance,
  emphasize,
  alpha,
  darken,
  lighten,
} from "./system";
export type {
  Direction,
  Breakpoint,
  BreakpointOverrides,
  Breakpoints,
  BreakpointsOptions,
  // CreateMUIStyled,
  CSSObject,
  // color manipulators
  ColorFormat,
  ColorObject,
} from "./system";
// export { default as useTheme } from "./useTheme";
// export { default as useThemeProps } from "./useThemeProps";
// export * from "./useThemeProps";
// export { default as styled } from "./styled";
/**
 * @deprecated will be removed in v5.beta, please use styled from @material-ui/core/styles instead
 */
// export { default as experimentalStyled } from "./styled";
// export { default as ThemeProvider } from "./ThemeProvider";
export type { ComponentsProps } from "./props";
export type { ComponentsVariants } from "./variants";
export type { ComponentsOverrides } from "./overrides";
// export { StyledEngineProvider } from "@material-ui/system";

export type ClassNameMap<ClassKey extends string = string> = Record<ClassKey, string>;

export interface StyledComponentProps<ClassKey extends string = string> {
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<ClassNameMap<ClassKey>>;
}

// export { default as makeStyles } from "./makeStyles";
// export { default as withStyles } from "./withStyles";
// export { default as withTheme } from "./withTheme";
