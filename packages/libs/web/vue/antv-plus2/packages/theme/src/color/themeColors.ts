/* eslint-disable no-use-before-define */
import { colorPalette } from "./colorPalette";
import { tinycolor } from "./tinyColor";

export function getThemeColors<K extends string>(key: K, color: string) {
  const r = {} as {
    [Key in `${K}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`]: string;
  };
  color = tinycolor.names[color as keyof typeof tinycolor.names] || color;
  for (let i = 1; i <= 10; i++) {
    // @ts-ignore
    r[key + i] = (i === 6 ? color : colorPalette(color, i)) as string;
  }
  return r;
}

export function getPaletteColor(color: PaletteColor | string): PaletteColor {
  const r = color instanceof Object ? color : ({} as PaletteColor);
  color =
    (typeof color === "string" && tinycolor.names[color as keyof typeof tinycolor.names]) || color;
  for (let i = 1; i <= 10; i++) {
    // @ts-ignore
    r[i] = r[i] || ((i === 6 ? color : colorPalette(color, i)) as string);
  }
  r.color = r[6];
  return r;
}

export type PaletteColor = {
  [Key in `${"color" | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`]: string;
};
