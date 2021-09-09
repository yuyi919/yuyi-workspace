/* eslint-disable no-redeclare */
import { ITheme } from "./types";

export function generateThemeConfig<T extends ITheme>(theme: T): T {
  return theme;
}

export * from "./staticTheme";
export * from "./types";
