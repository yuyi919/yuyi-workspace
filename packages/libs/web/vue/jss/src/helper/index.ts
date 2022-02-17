import { defaultsDeep } from "lodash";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { CreateCSSProperties, Styles } from "../styles";

const noop = Object.freeze({});
export function createThemeHelper<Theme>() {
  const methods = {
    definedUseStyles<Props extends Record<string, unknown>, ClassKey extends string = string>(
      styles: Styles<Theme, Props, ClassKey>
    ) {
      return styles;
    },

    defineMixins<Props extends Record<string, unknown>>(
      styles:
        | CreateCSSProperties<Props>
        | ((props: Props, theme?: Theme) => CreateCSSProperties<Props>)
    ) {
      return styles;
    },
    defineStaticMixins<Props extends Record<string, unknown>>(
      styles: CreateCSSProperties<Props> | ((theme?: Theme) => CreateCSSProperties<Props>)
    ) {
      return styles;
    },
    inheritDefineMixins<Props extends Record<string, unknown>>(
      styles:
        | CreateCSSProperties<Props>
        | ((props: Props, theme?: Theme) => CreateCSSProperties<Props>),
      props: Props,
      theme?: Theme
    ) {
      return (
        styles instanceof Function ? styles(props, theme) : styles
      ) as CreateCSSProperties<Props>;
    },
    inheritDefineStaticMixins<Props extends Record<string, unknown>>(
      styles: CreateCSSProperties<Props> | ((theme?: Theme) => CreateCSSProperties<Props>),
      theme?: Theme
    ) {
      return (styles instanceof Function ? styles(theme) : styles) as CreateCSSProperties<Props>;
    },

    defineStyles<Props extends Record<string, unknown>>(
      styles: CreateCSSProperties<Props>
    ): CreateCSSProperties<Props> {
      return styles;
    },

    templateToCssProperties<Props extends Record<string, unknown>>(styles: string) {
      return styles as unknown as CreateCSSProperties<Props>;
    },

    inheritTheme(theme: Partial<Theme>, defaultValues: Theme = {} as Theme) {
      return methods.inherit<Theme>(theme, defaultValues);
    },

    inherit<T>(theme: Partial<T>, ...defaultValues: Partial<T>[]): T {
      return defaultsDeep(theme, ...defaultValues);
    },
  };

  function defineCustomMixins<
    Props extends Record<string, unknown>,
    Styles extends (...args: any[]) => CreateCSSProperties<Props>
  >(styles: Styles): typeof styles;

  function defineCustomMixins<Props extends Record<string, unknown>>(
    styles: CreateCSSProperties<Props>
  ): CreateCSSProperties<Props>;
  function defineCustomMixins<Props extends Record<string, unknown>, Args extends any[]>(
    styles: CreateCSSProperties<Props> | ((...args: Args) => CreateCSSProperties<Props>)
  ) {
    return styles as CreateCSSProperties<Props> | ((...args: Args) => CreateCSSProperties<Props>);
  }

  function defineDeepClasses<
    Input extends { [K: string]: any },
    ClassNames extends Extract<keyof Input, string>,
    Prefix extends string,
    Result extends {
      [K in `${Prefix}-${ClassNames}`]: any;
    },
    Output extends {
      [K in `&$${Prefix}-${ClassNames}`]: any;
    },
    ClassKeyMap extends {
      [K in ClassNames]: `$${Prefix}-${K}`;
    }
  >(input: Input, prefix: Prefix) {
    const styles = {} as Result;
    const deepStyles = {} as Output;
    const keys = {} as ClassKeyMap;
    for (const key in input) {
      styles[`${prefix}-${key}` as any] = noop;
      deepStyles[`&$${prefix}-${key}` as any] = input[key];
      keys[key as string] = `$${prefix}-${key}` as `$${Prefix}-${ClassNames}`;
    }
    return {
      styles,
      keys,
      deepStyles,
    };
  }
  function defineStylesMixins<
    Input extends { [K: string]: any },
    ClassNames extends Extract<keyof Input, string>,
    Prefix extends string,
    Output extends {
      [K in `${Prefix}-${ClassNames}`]: Input[K extends `&$${Prefix}-${infer K}` ? K : never];
    },
    ClassKeyMap extends {
      [K in ClassNames]: `$${Prefix}-${K}`;
    }
  >(input: Input, prefix: Prefix) {
    const styles = {} as Output;
    const keys = {} as ClassKeyMap;
    for (const key in input) {
      styles[`${prefix}-${key}` as any] = input[key];
      keys[key as string] = `$${prefix}-${key}` as `$${Prefix}-${ClassNames}`;
    }
    return {
      keys,
      styles,
    };
  }
  function defineClassNames<
    ClassName extends string,
    Prefix extends string,
    Result extends {
      [K in `${Prefix}-${ClassName}`]: any;
    }
  >(className: ClassName[], prefix: Prefix) {
    const r = {} as any;
    for (const key of className) {
      r[`${prefix}-${key}`] = noop;
    }
    return r as Result;
  }
  return {
    ...methods,
    defineCustomMixins,
    defineDeepClasses,
    defineStylesMixins,
    defineClassNames,
  };
}
