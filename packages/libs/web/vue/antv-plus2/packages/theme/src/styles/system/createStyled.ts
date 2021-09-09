import * as CSS from "csstype";
export interface SerializedStyles {
  name: string;
  styles: string;
  map?: string;
  next?: SerializedStyles;
}

export type CSSProperties = CSS.PropertiesFallback<number | string>;
export type CSSPropertiesWithMultiValues = {
  [K in keyof CSSProperties]: CSSProperties[K] | Array<Extract<CSSProperties[K], string>>;
};
export type CSSPseudos = { [K in CSS.Pseudos]?: unknown | CSSObject };

export interface CSSOthersObject {
  [propertiesName: string]: unknown | CSSInterpolation;
}
export type CSSPseudosForCSSObject = { [K in CSS.Pseudos]?: CSSObject };

export interface ArrayCSSInterpolation extends Array<CSSInterpolation> {}

export interface CSSOthersObjectForCSSObject {
  [propertiesName: string]: CSSInterpolation;
}

export interface CSSObject extends CSSPropertiesWithMultiValues, CSSPseudos, CSSOthersObject {}

export interface ComponentSelector {
  __emotion_styles: any;
}

export type Keyframes = {
  name: string;
  styles: string;
  anim: number;
  toString: () => string;
} & string;

export type Equal<A, B, T, F> = A extends B ? (B extends A ? T : F) : F;

export type InterpolationPrimitive =
  | null
  | undefined
  | boolean
  | number
  | string
  | ComponentSelector
  | Keyframes
  | SerializedStyles
  | CSSObject;

export type CSSInterpolation = InterpolationPrimitive | ArrayCSSInterpolation;

export interface FunctionInterpolation<Props> {
  (props: Props): Interpolation<Props>;
}

export interface ArrayInterpolation<Props> extends Array<Interpolation<Props>> {}

export type Interpolation<Props> =
  | InterpolationPrimitive
  | ArrayInterpolation<Props>
  | FunctionInterpolation<Props>;
