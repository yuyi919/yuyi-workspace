import type { IComponent } from "../exports/component";
import type { IPalette } from "../exports/palette";
import type { IPaletteColors } from "../exports/palette.colors";
import { ThemeUtils } from "./utils";

export interface ThemePalette extends Readonly<IPalette> {
  colors: IPaletteColors;
}
export interface ComponentTheme {}
export interface ITheme {
  palette: ThemePalette;
  component: Readonly<IComponent>;
  components: ComponentTheme;
  utils: ThemeUtils;
}

declare module "../styled/provider" {
  interface Theme extends ITheme {}
}

export type { IPalette, IPaletteColors };
