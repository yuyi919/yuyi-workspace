/* eslint-disable no-redeclare */
import { computed, inject, provide } from "vue-demi";
import { WrapValue, unwrap } from "@yuyi919/vue-use";
import { ThemeProvider } from "vue-styled-components";

export { ThemeProvider };

export interface Theme {}
export type ThemeProps<P = {}> = P & { theme?: Theme };
export type HasTheme<P extends {}> = keyof P extends never
  ? false
  : Extract<keyof P, "theme"> extends never
  ? false
  : true;

export type TMixedProps<P> = P & {
  theme?: HasTheme<P> extends true ? ("theme" extends keyof P ? P["theme"] : never) : Theme;
};

export type TThemeProps<P = {}> = ThemeProps<P>;
// type A = { theme };
// type B = HasTheme<A>;

export type ThemeGetter<T extends Theme = Theme> = WrapValue<T>;
/**
 * 通过context传递获取theme对象
 * @param theme
 * @param defaultTheme
 */
export function useTheme<T extends Theme>(
  theme: ThemeGetter<T> = inject<any>("$theme", () => {}),
  defaultTheme?: ThemeGetter<T>
) {
  return computed<T>(() => unwrap(theme) || (defaultTheme && unwrap(defaultTheme)));
}
useTheme.provide = function useThemeProvide(getter: () => Theme) {
  const theme = computed(getter);
  provide("$theme", () => theme.value);
  return theme;
};
