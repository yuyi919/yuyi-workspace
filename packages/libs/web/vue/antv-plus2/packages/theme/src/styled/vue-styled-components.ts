declare module "vue-styled-components" {
  let Styled: any;

  export function injectGlobal<TProps, Theme>(
    ...args: import("./types").TemplateArgs<TProps, Theme>
  ): void;

  export const ThemeProvider: import("@antv-plus2/helper").VueComponent2<{
    theme: import("../theme").ITheme;
  }>;

  export function css<TProps, Theme>(
    ...args: import("./types").TemplateArgs<TProps, Theme>
  ): import("./types").PlainTemplateArgs<TProps, Theme>;

  export function keyframes<TProps, Theme>(
    ...args: string[] | import("./types").TemplateArgs<TProps, Theme>
  ): string;

  export default Styled;
}
