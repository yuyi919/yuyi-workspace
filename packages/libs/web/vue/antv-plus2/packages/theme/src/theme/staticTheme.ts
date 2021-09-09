import { component, useComponent } from "../exports/component";
import { palette, usePalette } from "../exports/palette";
import { paletteColors, usePaletteColors } from "../exports/palette.colors";
import { ITheme, ThemePalette } from "./types";
import { ThemeUtils } from "./utils";

export const STATIC_DEFAULT_THEME = createTheme();

export function createTheme() {
  let _utils: ThemeUtils;
  return {
    palette: Object.freeze({
      ...palette,
      colors: paletteColors,
    }) as ThemePalette,
    component,
    get utils() {
      return _utils || (_utils = new ThemeUtils(this));
    },
    components: {} as any,
  } as ITheme;
}
