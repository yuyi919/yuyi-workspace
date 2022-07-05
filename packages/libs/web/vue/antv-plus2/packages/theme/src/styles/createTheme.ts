import { deepmerge } from "./system/utils";
import { createBaseTheme, generateUtilityClass } from "./system";
import { createMixins } from "./createMixins";
import { createPalette } from "./createPalette";
import { createTypography } from "./createTypography";
import { shadows } from "./shadows";
import { createTransitions } from "./createTransitions";
import { zIndex } from "./zIndex";
import type { BaseThemeOptions, BaseTheme } from "./system";
import type { Mixins, MixinsOptions } from "./createMixins";
import type { Palette, PaletteOptions } from "./createPalette";
import type { Typography, TypographyOptions } from "./createTypography";
import type { ShadowsOption } from "./shadows";
import type { Transitions, TransitionsOptions } from "./createTransitions";
import type { ZIndex, ZIndexOptions } from "./zIndex";
import type { Components } from "./components";
import type { Types } from "@yuyi919/shared-types";

export interface ThemeOptions extends BaseThemeOptions {
  mixins?: MixinsOptions;
  components?: Components;
  palette?: PaletteOptions;
  shadows?: ShadowsOption;
  transitions?: TransitionsOptions;
  typography?: TypographyOptions | ((palette: Palette) => TypographyOptions);
  zIndex?: ZIndexOptions;
  unstable_strictMode?: boolean;
}

/**
 * Our [TypeScript guide on theme customization](https://material-ui.com/guides/typescript/#customization-of-theme) explains in detail how you would add custom properties.
 */
export interface Theme extends BaseTheme {
  mixins: Mixins;
  components?: Components;
  palette: Palette;
  shadows: ShadowsOption;
  transitions: Transitions;
  typography: Typography;
  zIndex: ZIndex;
  unstable_strictMode?: boolean;
}
export function createTheme(options?: ThemeOptions): Theme;
/**
 * Generate a theme base on the options received.
 * @param options - Takes an incomplete theme object and adds the missing parts.
 * @param args - Deep merge the arguments with the about to be returned theme.
 * @returns A complete, ready to use theme object.
 */
export function createTheme<MergeOptions extends Types.Recordable>(
  options?: MergeOptions & ThemeOptions
): Theme & MergeOptions;
/**
 * Generate a theme base on the options received.
 * @param options - Takes an incomplete theme object and adds the missing parts.
 * @param args - Deep merge the arguments with the about to be returned theme.
 * @returns A complete, ready to use theme object.
 */
export function createTheme<
  MergeOptions extends Types.Recordable,
  AppendOptions extends Types.Recordable
>(
  options?: MergeOptions & ThemeOptions,
  ...args: AppendOptions[]
): Theme & MergeOptions & AppendOptions;
export function createTheme<
  MergeOptions extends Types.Recordable,
  AppendOptions extends Types.Recordable
>(
  options?: MergeOptions & ThemeOptions,
  ...args: AppendOptions[]
): Theme & MergeOptions & AppendOptions {
  const {
    breakpoints: breakpointsInput,
    mixins: mixinsInput = {},
    spacing: spacingInput,
    palette: paletteInput = {},
    shadows: shadowsInput,
    transitions: transitionsInput = {},
    typography: typographyInput = {},
    shape: shapeInput,
    components: componentsInput,
    ...other
  } = options || {};

  const palette = createPalette(paletteInput);
  const systemTheme = createBaseTheme(options);

  let muiTheme: BaseTheme = deepmerge(systemTheme, {
    mixins: createMixins(systemTheme.breakpoints, systemTheme.spacing, mixinsInput),
    palette,
    // Don't use [...shadows] until you've verified its transpiled code is not invoking the iterator protocol.
    shadows: shadowsInput! || shadows.slice(),
    typography: createTypography(palette, typographyInput),
    components: componentsInput || {},
    transitions: createTransitions(transitionsInput),
    zIndex: { ...zIndex }
  });

  muiTheme = deepmerge(muiTheme, other);
  const theme = args.reduce((acc, argument) => deepmerge(acc, argument), muiTheme) as Theme &
    MergeOptions &
    AppendOptions;

  process.env.NODE_ENV !== "production" && productCheck<MergeOptions, AppendOptions>(theme);

  return theme;
}

let warnedOnce = false;

function productCheck<
  MergeOptions extends Types.Recordable,
  AppendOptions extends Types.Recordable
>(theme: Theme & MergeOptions & AppendOptions) {
  const stateClasses = [
    "active",
    "checked",
    "completed",
    "disabled",
    "error",
    "expanded",
    "focused",
    "focusVisible",
    "required",
    "selected"
  ];

  const traverse = (styleOverrides: any, component: string) => {
    let key;

    // eslint-disable-next-line guard-for-in, no-restricted-syntax
    for (key in styleOverrides) {
      const child = styleOverrides[key];
      if (stateClasses.indexOf(key) !== -1 && Object.keys(child).length > 0) {
        if (process.env.NODE_ENV !== "production") {
          const stateClass = generateUtilityClass("", key);
          console.error(
            [
              `Material-UI: The \`${component}\` component increases ` +
                `the CSS specificity of the \`${key}\` internal state.`,
              "You can not override it like this: ",
              JSON.stringify(styleOverrides, null, 2),
              "",
              `Instead, you need to use the '&.${stateClass}' syntax:`,
              JSON.stringify(
                {
                  root: {
                    [`&.${stateClass}`]: child
                  }
                },
                null,
                2
              ),
              "",
              "https://material-ui.com/r/state-classes-guide"
            ].join("\n")
          );
        }
        // Remove the style to prevent global conflicts.
        styleOverrides[key] = {};
      }
    }
  };

  (Object.keys(theme.components!) as (keyof Components)[]).forEach((component) => {
    //@ts-ignore
    const styleOverrides = theme.components![component]!.styleOverrides!;

    if (styleOverrides && component.indexOf("Mui") === 0) {
      traverse(styleOverrides, component);
    }
  });
}

/**
 * @deprecated
 * Use `import { createTheme } from '@material-ui/core/styles'` instead.
 */
export function createMuiTheme(options?: ThemeOptions, ...args: object[]): Theme;
export function createMuiTheme(...args: [object?, ...object[]]): Theme {
  if (process.env.NODE_ENV !== "production") {
    if (!warnedOnce) {
      warnedOnce = true;
      console.error(
        [
          "Material-UI: the createMuiTheme function was renamed to createTheme.",
          "",
          "You should use `import { createTheme } from '@material-ui/core/styles'`"
        ].join("\n")
      );
    }
  }

  return createTheme(...args);
}

// console.log('createTheme', createTheme({
//   palette: {
//     success: {
//       main: "rgba(1,1,1,1)"
//     }
//   }
// }));

export function createMuiStrictModeTheme<
  MergeOptions extends Types.Recordable,
  AppendOptions extends Types.Recordable
>(
  options?: ThemeOptions & MergeOptions,
  ...args: AppendOptions[]
): Theme & MergeOptions & AppendOptions {
  return createTheme<MergeOptions, AppendOptions>(
    (options
      ? {
          ...options,
          unstable_strictMode: true
        }
      : {
          unstable_strictMode: true
        }) as MergeOptions & ThemeOptions,
    ...args
  );
}
