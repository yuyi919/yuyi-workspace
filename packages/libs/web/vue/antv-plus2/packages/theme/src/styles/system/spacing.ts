import { handleBreakpoints } from "./breakpoints";
import { merge } from "./merge";
import { memoize } from "./memoize";
import { createUnarySpacing } from "./createTheme/createSpacing";
import Types from "@yuyi919/shared-types";
import { CSSProperties } from "./createStyled";

const directions = {
  t: "Top",
  r: "Right",
  b: "Bottom",
  l: "Left",
  x: ["Left", "Right"],
  y: ["Top", "Bottom"],
} as const;
export type DirectionsKeyword = keyof typeof directions;
export type DirectionsValue = Exclude<Types.ValueOf<typeof directions>, readonly string[]>;
const properties = {
  m: "margin",
  p: "padding",
} as const;
export type PropertiesKeyword = Types.KeyOf<typeof properties>;
export type PropertiesValue = Types.ValueOf<typeof properties>;
const aliases = {
  marginX: "mx",
  marginY: "my",
  paddingX: "px",
  paddingY: "py",
} as const;
type AliasesKey = Types.KeyOf<typeof aliases>;
type Aliases = Types.ValueOf<typeof aliases>;

// memoize() impact:
// From 300,000 ops/sec
// To 350,000 ops/sec
const getCssProperties = memoize((prop: AliasesKey | Aliases | Types.DynamicString) => {
  let r: Aliases;
  // It's not a shorthand notation.
  if (prop.length > 2) {
    if (prop in aliases) {
      r = aliases[prop as AliasesKey] as Aliases;
    } else {
      return [prop] as [keyof CSSProperties];
    }
  } else {
    r = prop as Aliases;
  }

  const [a, b] = r!.split("") as [PropertiesKeyword, DirectionsKeyword];
  const property = properties[a];
  const direction = directions[b] || "";
  return Array.isArray(direction)
    ? ((direction as unknown as DirectionsValue[]).map((dir) => property + dir) as
        | [`${PropertiesValue}Left`, `${PropertiesValue}Right`]
        | [`${PropertiesValue}Top`, `${PropertiesValue}Bottom`])
    : ([property + direction] as [`${PropertiesValue}${DirectionsValue}`]);
});

const marginKeys = [
  "m",
  "mt",
  "mr",
  "mb",
  "ml",
  "mx",
  "my",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "marginX",
  "marginY",
];

const paddingKeys = [
  "p",
  "pt",
  "pr",
  "pb",
  "pl",
  "px",
  "py",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "paddingX",
  "paddingY",
];

const spacingKeys = [...marginKeys, ...paddingKeys];

export function getValue(transformer: any, propValue?: string | null) {
  if (typeof propValue === "string" || propValue == null) {
    return propValue;
  }

  const abs = Math.abs(propValue);
  const transformed = transformer(abs);

  if (propValue >= 0) {
    return transformed;
  }

  if (typeof transformed === "number") {
    return -transformed;
  }

  return `-${transformed}`;
}

export function getStyleFromPropValue(cssProperties: (keyof CSSProperties)[], transformer: any) {
  return (propValue: string) =>
    cssProperties.reduce((acc, cssProperty) => {
      acc[cssProperty] = getValue(transformer, propValue);
      return acc;
    }, {} as Types.Recordable);
}

function resolveCssProperty(
  props: Types.Recordable,
  keys: string[],
  prop: string,
  transformer: any
) {
  // Using a hash computation over an array iteration could be faster, but with only 28 items,
  // it's doesn't worth the bundle size.
  if (keys.indexOf(prop) === -1) {
    return null;
  }

  const cssProperties = getCssProperties(prop);
  const styleFromPropValue = getStyleFromPropValue(cssProperties, transformer);

  const propValue = props[prop];
  return handleBreakpoints(props, propValue, styleFromPropValue);
}

function style(props: Types.Recordable, keys: string[]) {
  const transformer = createUnarySpacing(props.theme);

  return Object.keys(props)
    .map((prop) => resolveCssProperty(props, keys, prop, transformer))
    .reduce(merge, {});
}

export const margin = (props: MarginProps) => {
  return style(props, marginKeys);
};
export type MarginProps = Partial<
  Record<
    | "m"
    | "mt"
    | "mr"
    | "mb"
    | "ml"
    | "mx"
    | "my"
    | "margin"
    | "marginTop"
    | "marginRight"
    | "marginBottom"
    | "marginLeft"
    | "marginX"
    | "marginY",
    any
  >
>;
// margin.propTypes =
//   process.env.NODE_ENV !== "production"
//     ? marginKeys.reduce((obj, key) => {
//         obj[key] = responsivePropType;
//         return obj;
//       }, {})
//     : {};

margin.filterProps = marginKeys;

export function padding(props: PaddingProps) {
  return style(props, paddingKeys);
}
export type PaddingProps = Partial<
  Record<
    | "p"
    | "pt"
    | "pr"
    | "pb"
    | "pl"
    | "px"
    | "py"
    | "padding"
    | "paddingTop"
    | "paddingRight"
    | "paddingBottom"
    | "paddingLeft"
    | "paddingX"
    | "paddingY",
    any
  >
>;

// padding.propTypes =
//   process.env.NODE_ENV !== "production"
//     ? paddingKeys.reduce((obj, key) => {
//         obj[key] = responsivePropType;
//         return obj;
//       }, {})
//     : {};

padding.filterProps = paddingKeys;

export function spacing(props: SpacingProps) {
  return style(props, spacingKeys);
}

export type SpacingProps = Partial<
  Record<
    | "m"
    | "mt"
    | "mr"
    | "mb"
    | "ml"
    | "mx"
    | "my"
    | "p"
    | "pt"
    | "pr"
    | "pb"
    | "pl"
    | "px"
    | "py"
    | "margin"
    | "marginTop"
    | "marginRight"
    | "marginBottom"
    | "marginLeft"
    | "marginX"
    | "marginY"
    | "padding"
    | "paddingTop"
    | "paddingRight"
    | "paddingBottom"
    | "paddingLeft"
    | "paddingX"
    | "paddingY",
    any
  >
>;
// spacing.propTypes =
//   process.env.NODE_ENV !== "production"
//     ? spacingKeys.reduce((obj, key) => {
//         obj[key] = responsivePropType;
//         return obj;
//       }, {})
//     : {};

spacing.filterProps = spacingKeys;
