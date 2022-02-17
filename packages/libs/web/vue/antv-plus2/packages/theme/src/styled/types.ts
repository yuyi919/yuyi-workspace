import type { VueComponent2 } from "@antv-plus2/helper";
import { TThemeProps } from "./provider";

export type PlainTemplateArgs<TProps, Theme> = (
  | VueComponent2<any>
  | ((props: TThemeProps<TProps>, theme?: Theme) => any)
  | PlainTemplateArgs<TProps, Theme>
  | string
  | number
)[];

export type TemplateArgs<TProps, Theme> = [
  TemplateStringsArray,
  ...(
    | VueComponent2<any>
    | ((props: TThemeProps<TProps>, theme?: Theme) => any)
    | PlainTemplateArgs<TProps, Theme>
    | string
    | number
    | undefined
    | null
  )[]
];
