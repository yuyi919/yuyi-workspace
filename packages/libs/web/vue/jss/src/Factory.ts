/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Types from "@yuyi919/shared-types";
import * as CSS from "csstype";
import { CreateCSSProperties, PropsFunc, BaseCSSProperties } from "./styles";
// import { createUseStylesHooks } from "./createUseStylesHook";
// import { createThemeHelper } from "./helper";
// import { define } from "./helper/merge";
import { createHooksApi } from "./hooks";
import { createGenerateClassName } from "./utils/createGenerateClassName";
// Disable automatic export
export {};

// private JSS type that should be public
type JSSNormalCssProperties = CSS.Properties<number | string>;
// type JSSFontface = CSS.AtRule.FontFace & { fallbacks?: CSS.AtRule.FontFace[] };

type BaseCreateStyleValue<Props extends keyof BaseCSSProperties> = BaseCSSProperties[Props];
export type BaseCreateStyle<Props extends Types.IObj> = {
  [P in keyof BaseCSSProperties]:
    | BaseCreateStyleValue<P>
    | PropsFunc<Props, BaseCreateStyleValue<P>>;
};

export type CreateStyle<Theme extends Types.IObj, Props extends Types.IObj = Types.IObj> =
  | BaseCreateStyle<Props>
  | ((theme?: Theme) => BaseCreateStyle<Props>);

// export interface CreateCSSProperties<Props extends Types.IObj = Types.IObj>
//   extends BaseCreateStyle<Props> {
//   // Allow pseudo selectors and media queries
//   [k: string]: BaseCreateStyle<Props>[keyof BaseCreateStyle<Props>] | CreateCSSProperties<Props>;
// }

// export class StyleSheetFactory<Theme, Names extends string> {
//   _hasTheme = false;
//   constructor(public names: Record<Names, string>, public initialTheme?: Theme) {
//     for (const name in names) {
//       this.keys[name] = `$${name}` as const;
//       this.sheets[name] = defineNew<Theme, any>();
//     }
//   }
//   sheets: Record<Names, CreateCSSPropertiesTrack<Theme, any>> = {} as Record<Names, any>;
//   keys: {
//     [K in Names]: `$${Names}`;
//   } = {} as {
//     [K in Names]: `$${Names}`;
//   };
//   useTheme<ITheme>(): StyleSheetFactory<ITheme, Names> {
//     return this as unknown as StyleSheetFactory<ITheme, Names>;
//   }

//   use<Props extends Types.IObj, Name extends Names = Names>(
//     name: Name,
//     initialProps?: Props
//   ): StyleFactory<Theme, Names, Props> {
//     return new StyleFactory(this, [name], this.sheets[name]);
//   }

//   update(name: Names, styles: any) {
//     if (name in this.sheets) {
//       this.sheets[name] = styles;
//     }
//   }

//   export() {
//     if (this._hasTheme) {
//       return this.exportThemed;
//     }
//     return this.sheets;
//   }

//   private exportThemed = (theme: Theme) => {
//     return this.getThemedStyles(this, "sheets", theme);
//   };

//   private getThemedStyles(source: any, key: string, theme: Theme): any {
//     const result = {} as any;
//     if (!(source[key] instanceof Object) || source[key] instanceof Array) return source[key];
//     const { extend, _defaults, ...out } = (source[key] || {}) as CreateCSSPropertiesTrack<
//       Theme,
//       any
//     >;
//     for (const key in out) {
//       result[key] = this.getThemedStyles(out, key, theme);
//     }
//     if (extend?.length > 0 || _defaults) {
//       const themedExtends =
//         extend && _defaults ? [_defaults, ...extend] : extend ? extend : [_defaults];
//       console.log(themedExtends.map((e) => (e instanceof Function ? e(theme) : e)));
//       return define({
//         extend: themedExtends.map((e) => (e instanceof Function ? e(theme) : e)),
//         ...result,
//       });
//     }
//     return result;
//   }
// }
// type CreateCSSPropertiesTrack<iTheme, Props> = {
//   extend: CreateStyle<iTheme, Props>[];
// } & Record<(string & Types.IObj) | "_defaults", CreateStyle<iTheme, Props>>;

// export class StyleFactory<Theme, Names extends string, Props> {
//   constructor(
//     public sheet: StyleSheetFactory<Theme, Names>,
//     public name: Names[],
//     private styles: CreateCSSPropertiesTrack<Theme, Props>,
//     private parent?: StyleFactory<Theme, Names, Props>
//   ) {}

//   update(name: Names, styles: any) {
//     if (name in this.styles) {
//       this.styles[name] = styles;
//     }
//   }
//   append(style: CreateStyle<Theme, Props>): StyleFactory<Theme, Names, Props> {
//     this.styles.extend.push(style);
//     if (style instanceof Function) {
//       this.sheet._hasTheme = true;
//     }
//     return this;
//   }

//   selectConcat(
//     name: Names,
//     callback: (story: StyleFactory<Theme, Names, Props>) => void
//   ): StyleFactory<Theme, Names, Props>;
//   selectConcat(name: Names, style?: BaseCreateStyle<Props>): StyleFactory<Theme, Names, Props>;
//   selectConcat(
//     name: Names,
//     style?: BaseCreateStyle<Props> | ((story: StyleFactory<Theme, Names, Props>) => void)
//   ): StyleFactory<Theme, Names, Props> {
//     const init = style instanceof Function ? void 0 : style;
//     const next = new StyleFactory<Theme, Names, Props>(
//       this.sheet,
//       [...this.name, name],
//       (this.styles[("&" + this.sheet.keys[name]) as string] = defineNew<Theme, Props>(init)),
//       this
//     );
//     if (style instanceof Function) {
//       style(next);
//     }
//     return this;
//   }

//   end(): StyleSheetFactory<Theme, Names> {
//     // const { _defaults, ...styles } = this.styles;
//     // (this.parent || this.sheet).update(
//     //   this.name[this.name.length - 1],
//     //   defaultsDeep(styles, _defaults)
//     // );
//     return this.sheet;
//   }
//   defaults(style: BaseCreateStyle<Props>): StyleFactory<Theme, Names, Props> {
//     this.styles._defaults = style;
//     return this;
//   }
// }

export interface ITheme {
  color: string;
  borderRadius: number;
}
// function defineNew<Theme, Props extends Types.IObj>(init?: any) {
//   return {
//     extend: init ? [init] : ([] as CreateStyle<Theme, Props>[]),
//   } as CreateCSSPropertiesTrack<Theme, Props>;
// }

// export function useFactory<ITheme, Names extends string = string>(
//   names: Record<Names, string>,
//   initialTheme?: ITheme
// ): StyleSheetFactory<ITheme, Names> {
//   return new StyleSheetFactory<ITheme, Names>(names, initialTheme);
// }
// const $ = createThemeHelper<ITheme>();
// $.defineStyles({
//   width: 1,
// });

// export const sheet = useFactory({
//   button: "btn",
//   sizeLg: "size-lg",
// })
//   .useTheme<ITheme>()
//   .use("button", { size: 1 })
//   .append((theme) => ({
//     color: theme.color,
//     fontSize: (props) => props.size,
//   }))
//   .defaults({
//     color: "red",
//     background: "url(image1.png) url(image2.png) !important",
//   })
//   .selectConcat("sizeLg", (style) => {
//     style
//       .append((theme) => ({
//         borderRadius: theme.borderRadius,
//       }))
//       .end();
//   })
//   .end();

export const theme = { borderRadius: 5, color: void 0 };
const { useBlock, createStylesHook, useElement, useTheme } = createHooksApi<ITheme>(theme);

function useButton() {
  const theme = useTheme();
  const button = useBlock("button")
    .append<{ size: number }>({
      color: theme.color,
      fontSize: 12
    })
    .defaults({
      color: "red",
      background: "url(image1.png) url(image2.png) !important"
    });

  const buttonText = useElement(button, "text").append({
    color: "white",
    fontSize: 12
  });
  return {
    button,
    buttonText
  };
}

export const createStyleHooks = createStylesHook(useButton, {
  name: "Button",
  generateId: createGenerateClassName({ seed: "ant", global: true })
  // (rule, sheet) => {
  //   console.log(rule, sheet);
  //   return ((sheet && sheet.options.classNamePrefix) || "") + rule.key.replace("\\", "");
  // }
});

let size = 5;
for (let i = 0; i < 3; i++) {
  const hooks = createStyleHooks({ size });
  hooks.init(theme, {});
  hooks.update({ size: size++ });
  console.log(hooks.getClasses());
  // console.log(sheet.keys, sheet.sheets, hooks.getClasses());
  // console.log(hooks.sheet.toString());
}
// export const useSheet = createUseStyles((theme: ITheme) => ({
//   button: {
//     color: theme.color,
//     fontSize: (props) => props.size,
//     "@global": {},
//   },
// }));
