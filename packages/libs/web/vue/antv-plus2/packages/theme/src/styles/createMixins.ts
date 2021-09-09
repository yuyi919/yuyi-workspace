import * as CSS from "csstype";
import { Types } from "@yuyi919/shared-types";
import { Breakpoints, Spacing } from "./system";

export type NormalCssProperties = CSS.Properties<number | string>;
export type Fontface = CSS.AtRule.FontFace & { fallbacks?: CSS.AtRule.FontFace[] };

/**
 * Allows the user to augment the properties available
 */
export interface BaseCSSProperties extends NormalCssProperties {
  "@font-face"?: Fontface | Fontface[];
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

export interface IMixins {
  toolbar: CSSProperties;
  // ... use interface declaration merging to add custom mixins
}

export interface IMixinsOptions extends Partial<IMixins> {
  // ... use interface declaration merging to add custom mixin options
}
export type MixinsOptions<T extends Types.Recordable = Types.Recordable> = IMixinsOptions & T;
export type Mixins<T extends Types.Recordable = Types.Recordable> = IMixins & T;

export function createMixins<T extends Types.Recordable>(
  breakpoints: Breakpoints,
  spacing: Spacing,
  mixins: MixinsOptions<T>
): Mixins<T> {
  return {
    toolbar: {
      minHeight: 56,
      [`${breakpoints.up("xs")} and (orientation: landscape)`]: {
        minHeight: 48,
      },
      [breakpoints.up("sm")]: {
        minHeight: 64,
      },
    },
    ...mixins,
  };
}
