/* eslint-disable no-useless-constructor */
import { ITheme } from "./types";
import { component, useComponent } from "../exports/component";
import { usePalette } from "../exports/palette";
import { usePaletteColors } from "../exports/palette.colors";
import { Theme } from "../styled";
import { fade } from "../color";

export class ThemeUtils {
  constructor(public theme: ITheme) {}
  prefixCls(name: string): string {
    return (this.theme?.component?.prefixCls || component.prefixCls) + name;
  }
  static getComponent = useComponent;
  static getPalette = usePalette;
  static defaultTo<T, Prop>(
    value: (props: Prop, theme?: Theme) => T,
    getter: (props: { theme?: Theme }, theme?: Theme) => T
  ): (props: Prop & { theme?: Theme }, theme?: Theme) => T {
    return (props) => value(props) ?? getter(props);
  }
  static compose<T, Prop>(
    getter: (props: { theme?: Theme }, theme?: Theme) => T,
    ...pipe: ((value: T) => T)[]
  ): (props: Prop & { theme?: Theme }, theme?: Theme) => T {
    return (props) => pipe.reduce((r, pipe) => pipe(r), getter(props));
  }
  static fade<T extends string>(amount: string | number) {
    return (props: T) => fade(props, amount);
  }
  static getPaletteColors = usePaletteColors;
}
