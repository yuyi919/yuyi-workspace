/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Types from "@yuyi919/shared-types";
import { Classes } from "jss";
import { ComputedRef } from "vue-demi";
import {
  createUseStyles as _createUseStyles,
  CreateUseStylesOptions,
  createUseStylesWithHook
} from "./createUseStyles";
import {
  CreateUseStylesHookOptions,
  createUseStylesHooks,
  StyleHooks
} from "./createUseStylesHook";
import { BaseCreateStyle } from "./Factory";
import { define } from "./helper/merge";
import { defineClasses, defineStyles, StyleObjectThemedCallback, Styles } from "./styles";
import { Theming, createTheming } from "./theming";

export class StylesApi<Role, P = any, N extends string = string> {
  protected extend: BaseCreateStyle<P>[] = [];
  protected default: BaseCreateStyle<P>[] = [];
  protected composes: string[];
  ref: `$${N}`;
  constructor(public role: Role, public styles: BaseCreateStyle<P> = {}, public name?: N) {
    this.ref = `$${name}` as `$${N}`;
  }
  append<Props extends P>(style: BaseCreateStyle<Props>): StylesApi<Role, Props, N> {
    this.extend.push(style);
    return this;
  }
  defaults<Props extends P>(style: BaseCreateStyle<Props>): StylesApi<Role, Props, N> {
    this.default.push(style);
    return this;
  }
  export(useTheme?: boolean) {
    if (useTheme) {
      return (theme: any) => this.getThemedStyles(theme);
    }
    return this.styles;
  }
  useSelector(selector: string | string[]) {
    selector = selector instanceof Array ? selector.join(",") : selector;
    return this;
  }
  compose(compose: string | StylesApi<any>) {
    compose = typeof compose === "string" ? compose : compose.ref;
    this.composes = this.composes ? [...this.composes, compose] : [compose];
    return this;
  }
  private getThemedStyles<ITheme>(theme: ITheme): BaseCreateStyle<P> {
    const result = {} as any;
    const { extend, default: _defaults, ...out } = this;
    // for (const key in out) {
    //   result[key] = this.getThemedStyles(out, key, theme);
    // }
    if (extend?.length > 0 || _defaults) {
      const themedExtends =
        extend && _defaults ? [..._defaults, ...extend] : extend ? extend : [..._defaults];
      // console.log(themedExtends.map((e) => (e instanceof Function ? e(theme) : e)));
      const styles = define({
        extend: themedExtends.map((e) => (e instanceof Function ? e(theme) : e)),
        ...result
      });
      if (this.composes) {
        styles.composes = this.composes;
      }
      return styles;
    }
    return result;
  }
}
export class IBlock<P = any, N extends string = string> extends StylesApi<"block", P, N> {
  constructor(name: N) {
    super("block", void 0, name);
  }
}
export class IElement<P = any, N extends string = string> extends StylesApi<"element", P, N> {
  constructor(name: N) {
    super("element", void 0, name);
  }
}
export class IModifier<P = any, N extends string = string> extends StylesApi<"modifier", P, N> {
  constructor(name: N) {
    super("modifier", void 0, name);
  }
}
interface HookContext<ITheme> {
  theme?: ITheme;
  useTheme?: boolean;
}

export type ExtractStylesApi<Target extends Record<string, StylesApi<any>>> = {
  [K in keyof Target]: Target[K] extends StylesApi<any, infer P> ? BaseCreateStyle<P> : never;
};

const defaultName = "__hooks_jss_provide_key__";
let i = 0;

export interface IHooksApi<ITheme> {
  ThemeContext: Theming<ITheme>;
  createUseStyles: <Props extends Types.IObj<any>, C extends string = string>(
    styles: Styles<ITheme, Props, C>,
    options?: CreateUseStylesOptions<ITheme>
  ) => (data?: Props) => ComputedRef<Classes<C>>;
  defineClasses: typeof defineClasses;
  defineStyles: typeof defineStyles;
  createThemedMixins: <Props extends Types.IObj<any>, Args extends any[]>(
    styles: StyleObjectThemedCallback<ITheme, Props, Args>
  ) => StyleObjectThemedCallback<ITheme, Props, Args>;
  createUseStylesHook: <R extends Record<string, StylesApi<any, any, string>>>(
    hooks: () => R,
    options?: CreateUseStylesHookOptions
  ) => (data?: unknown) => ComputedRef<Classes<Extract<keyof R, string>>>;
  createStylesHook: <R extends Record<string, StylesApi<any, any, string>>>(
    hooks: () => R,
    options?: CreateUseStylesHookOptions
  ) => <Data>(initialData: Data) => StyleHooks<ITheme, Data, Extract<keyof R, string>>;
  useBlock: <N extends string>(name: N) => IBlock<any, N>;
  useElement: <B extends IBlock<any, string>, N extends string>(
    block: B,
    name: N
  ) => IElement<any, `${B["name"]}-${N}`>;
  useTheme: () => ITheme;
}

export function createHooksApi<ITheme>(
  defaultTheme: ITheme,
  themeName?: string
): IHooksApi<ITheme> {
  const ThemeContext = createTheming(themeName || defaultName + i++, defaultTheme);
  const context: HookContext<ITheme> = {
    theme: void 0
  };
  function createUseStyles<Props extends Types.IObj, C extends string = string>(
    styles: Styles<ITheme, Props, C>,
    options: CreateUseStylesOptions<ITheme> = {}
  ): (data?: Props) => ComputedRef<Classes<C>> {
    return _createUseStyles(
      styles,
      options.theming ? options : { ...options, theming: ThemeContext }
    );
  }
  function createThemedMixins<Props extends Types.IObj, Args extends any[]>(
    styles: StyleObjectThemedCallback<ITheme, Props, Args>
  ): StyleObjectThemedCallback<ITheme, Props, Args> {
    return styles;
  }
  function createStylesHook<R extends Record<string, StylesApi<any>>>(
    hooks: () => R,
    options?: CreateUseStylesHookOptions
  ) {
    let sheets: R;
    try {
      sheets = hooks.call(this);
    } catch (error) {
      if (!context.useTheme) throw error;
    }
    const keyMap = {} as any;
    return createUseStylesHooks<ITheme, Extract<keyof R, string>, any>(
      (theme: ITheme) => {
        context.theme = theme;
        const r: R = sheets || hooks.call(this);
        const result = {} as any;
        // eslint-disable-next-line guard-for-in
        for (const key in r) {
          const api = r[key] as StylesApi<any>;
          const exported = api.export(context.useTheme);
          const realKey = api.name as keyof R;
          keyMap[realKey] = key;
          result[realKey] = exported instanceof Function ? exported(theme) : exported;
        }
        return result as ExtractStylesApi<R>;
      },
      options,
      keyMap
    );
  }
  function createUseStylesHook<R extends Record<string, StylesApi<any>>>(
    hooks: () => R,
    options?: CreateUseStylesHookOptions
  ) {
    return createUseStylesWithHook(createStylesHook(hooks, options), ThemeContext);
  }
  function useBlock<N extends string>(name: N) {
    return new IBlock<any, N>(name);
  }
  function useElement<B extends IBlock, N extends string>(block: B, name: N) {
    return new IElement<any, `${B["name"]}-${N}`>(`${block.name}-${name}` as `${B["name"]}-${N}`);
  }
  function useTheme(): ITheme {
    context.useTheme = true;
    return context.theme;
  }
  return {
    ThemeContext,
    createUseStyles,
    defineClasses,
    defineStyles,
    createThemedMixins,
    createUseStylesHook,
    createStylesHook,
    useBlock,
    useElement,
    useTheme
  };
}
