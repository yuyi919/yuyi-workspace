// import * as React from 'react';
// import { PropInjector } from '@material-ui/types';
import * as CSS from "csstype";
import Types from "@yuyi919/shared-types";

// Disable automatic export
export {};

// private JSS type that should be public
export type JSSNormalCssProperties = CSS.Properties<number | string>;
// type JSSFontface = CSS.AtRule.FontFace & { fallbacks?: CSS.AtRule.FontFace[] };

export type PropsFunc<Props extends Types.IObj, T> = (props: Props) => T | [T, "!important"];

/**
 * Allows the user to augment the properties available
 */
export interface BaseCSSProperties extends JSSNormalCssProperties {
  // '@font-face'?: JSSFontface | JSSFontface[];
}

export interface CSSProperties extends BaseCSSProperties {
  // Allow pseudo selectors and media queries
  // `unknown` is used since TS does not allow assigning an interface without
  // an index signature to one with an index signature. This is to allow type safe
  // module augmentation.
  // Technically we want any key not typed in `BaseCSSProperties` to be of type
  // `CSSProperties` but this doesn't work. The index signature needs to cover
  // BaseCSSProperties as well. Usually you would use `BaseCSSProperties[keyof BaseCSSProperties]`
  // but this would not allow assigning React.CSSProperties to CSSProperties
  [k: string]: unknown | CSSProperties;
}

export type BaseCreateCSSProperties<Props extends Types.IObj = Types.IObj> = {
  [P in keyof BaseCSSProperties]: BaseCSSProperties[P] | PropsFunc<Props, BaseCSSProperties[P]>;
};

export interface CreateCSSProperties<Props extends Types.IObj = Types.IObj>
  extends BaseCreateCSSProperties<Props> {
  // Allow pseudo selectors and media queries
  [k: string]:
    | BaseCreateCSSProperties<Props>[keyof BaseCreateCSSProperties<Props>]
    | CreateCSSProperties<Props>;
}

export type StyleObject<Props extends Types.IObj = Types.IObj> =  // JSS property bag
  | CSSProperties
  // JSS property bag where values are based on props
  | CreateCSSProperties<Props>;

/**
 * This is basically the API of JSS. It defines a Map<string, CSS>,
 * where
 * - the `keys` are the class (names) that will be created
 * - the `values` are objects that represent CSS rules (`React.CSSProperties`).
 *
 * if only `CSSProperties` are matched `Props` are inferred to `any`
 */
export type StyleRules<
  Props extends Types.IObj = Types.IObj,
  ClassKey extends string = string
> = Record<
  ClassKey,
  | StyleObject<Props>
  // JSS property bag based on props
  | PropsFunc<Props, CreateCSSProperties<Props>>
>;

/**
 * @internal
 */
export type StyleRulesCallback<
  Theme,
  Props extends Types.IObj,
  ClassKey extends string = string
> = (theme: Theme) => StyleRules<Props, ClassKey>;

export type StyleObjectCallback<Props extends Types.IObj, Args extends any[]> = (
  ...args: Args
) => StyleObject<Props>;
export type StyleObjectThemedCallback<Theme, Props extends Types.IObj, Args extends any[]> = (
  theme: Theme,
  ...args: Args
) => StyleObject<Props>;

export type StyleMixin<Theme, Props extends Types.IObj, Args extends any[]> =
  | StyleObject<Props>
  | StyleObjectCallback<Props, Args>
  | StyleObjectThemedCallback<Theme, Props, Args>;

export type Styles<Theme, Props extends Types.IObj, ClassKey extends string = string> =
  | StyleRules<Props, ClassKey>
  | StyleRulesCallback<Theme, Props, ClassKey>;

export type ClassNameMap<ClassKey extends string = string> = Record<ClassKey, string>;

export function defineStyles<Props extends Types.IObj>(
  styles: StyleObject<Props>
): StyleObject<Props>;
export function defineStyles<Props extends Types.IObj, Args extends any[]>(
  styles: StyleObjectCallback<Props, Args>
): StyleObjectCallback<Props, Args>;
export function defineStyles<Props extends Types.IObj>(
  styles: BaseCreateCSSProperties<Props>
): BaseCreateCSSProperties<Props>;
export function defineStyles<T extends BaseCSSProperties>(
  styles: T
): {
  [K in keyof T]: K extends keyof BaseCSSProperties ? BaseCSSProperties[K] : T[K];
};
export function defineStyles(styles: any) {
  return styles;
}

export function defineClasses<Props extends Types.IObj, ClassKey extends string = string>(
  styles: StyleRules<Props, ClassKey>
): StyleRules<Props, ClassKey>;
export function defineClasses<Theme, Props extends Types.IObj, ClassKey extends string = string>(
  styles: StyleRulesCallback<Theme, Props, ClassKey>
): StyleRulesCallback<Theme, Props, ClassKey>;
export function defineClasses(styles: any) {
  return styles;
}
