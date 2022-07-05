import {
  BreakpointsOptions,
  ShapeOptions,
  SpacingOptions,
  createBreakpoints,
  createSpacing
} from "./system";
import { MixinsOptions } from "./createMixins";
import { Palette, PaletteOptions } from "./createPalette";
import { TypographyOptions } from "./createTypography";
import { ShadowsOption } from "./shadows";
import { TransitionsOptions } from "./createTransitions";
import { ZIndexOptions } from "./zIndex";
import { ComponentsOverrides } from "./overrides";
import { ComponentsVariants } from "./variants";
import { ComponentsProps } from "./props";
import { Theme } from "./createTheme";

export type Direction = "ltr" | "rtl";

export interface DeprecatedThemeOptions {
  shape?: ShapeOptions;
  breakpoints?: BreakpointsOptions;
  direction?: Direction;
  mixins?: MixinsOptions;
  overrides?: ComponentsOverrides;
  palette?: PaletteOptions;
  props?: ComponentsProps;
  shadows?: ShadowsOption;
  spacing?: SpacingOptions;
  transitions?: TransitionsOptions;
  typography?: TypographyOptions | ((palette: Palette) => TypographyOptions);
  variants?: ComponentsVariants;
  zIndex?: ZIndexOptions;
  unstable_strictMode?: boolean;
}

/**
 * Generate a theme base on the V4 theme options received.
 * @deprecated Follow the upgrade guide on https://material-ui.com/r/migration-v4#theme
 * @param options - Takes an incomplete theme object and adds the missing parts.
 * @returns A complete, ready to use theme object.
 */
export function adaptV4Theme(inputTheme?: DeprecatedThemeOptions): Theme {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      [
        "Material-UI: adaptV4Theme() is deprecated.",
        "Follow the upgrade guide on https://material-ui.com/r/migration-v4#theme."
      ].join("\n")
    );
  }

  const {
    defaultProps = {},
    mixins = {},
    overrides = {},
    palette = {},
    props = {},
    styleOverrides = {},
    ...other
  } = inputTheme || ({} as any);
  const theme = {
    ...other,
    components: {}
  };

  // default props
  Object.keys(defaultProps).forEach((component) => {
    const componentValue = theme.components[component] || {};
    componentValue.defaultProps = defaultProps[component];
    theme.components[component] = componentValue;
  });

  Object.keys(props).forEach((component) => {
    const componentValue = theme.components[component] || {};
    componentValue.defaultProps = props[component];
    theme.components[component] = componentValue;
  });

  // css overrides
  Object.keys(styleOverrides).forEach((component) => {
    const componentValue = theme.components[component] || {};
    componentValue.styleOverrides = styleOverrides[component];
    theme.components[component] = componentValue;
  });

  Object.keys(overrides).forEach((component) => {
    const componentValue = theme.components[component] || {};
    componentValue.styleOverrides = overrides[component];
    theme.components[component] = componentValue;
  });

  // theme.spacing
  theme.spacing = createSpacing(inputTheme!.spacing);

  // theme.mixins.gutters
  const breakpoints = createBreakpoints(inputTheme!.breakpoints || {});
  const spacing = theme.spacing;

  theme.mixins = {
    gutters: (styles: any = {}) => {
      return {
        paddingLeft: spacing(2),
        paddingRight: spacing(2),
        ...styles,
        [breakpoints.up("sm")]: {
          paddingLeft: spacing(3),
          paddingRight: spacing(3),
          ...styles[breakpoints.up("sm") as any]
        }
      };
    },
    ...mixins
  };

  const { type: typeInput, mode: modeInput, ...paletteRest } = palette;

  const finalMode = modeInput || typeInput || "light";

  theme.palette = {
    // theme.palette.text.hint
    text: {
      hint: finalMode === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.38)"
    },
    mode: finalMode,
    type: finalMode,
    ...paletteRest
  };

  return theme;
}
