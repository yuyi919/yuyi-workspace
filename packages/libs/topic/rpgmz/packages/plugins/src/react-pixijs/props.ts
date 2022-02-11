import type {
  YogaFlexDirection,
  YogaAlign,
  YogaJustifyContent,
  YogaFlexWrap,
  YogaDirection,
} from "yoga-layout-prebuilt";
import { camelCase } from "lodash-es";
export type FlexYogaDirection = YogaDirection | "ltr" | "rtl";
export type FlexPlane = "xy" | "yz" | "xz";

export type Value = string | number;

export type FlexDirection = YogaFlexDirection | "row" | "column" | "row-reverse" | "column-reverse";

export type JustifyContent =
  | YogaJustifyContent
  | "center"
  | "flex-end"
  | "flex-start"
  | "space-between"
  | "space-evenly"
  | "space-around";

export type Align =
  | YogaAlign
  | "auto"
  | "baseline"
  | "center"
  | "flex-end"
  | "flex-start"
  | "space-around"
  | "space-between"
  | "stretch";

export type FlexWrap = YogaFlexWrap | "no-wrap" | "wrap" | "wrap-reverse";

export type R3FlexProps = Partial<{
  // Align
  alignContent: Align;
  alignItems: Align;
  alignSelf: Align;
  // Shorthand for alignItems
  align: Align;

  // Justify
  justifyContent: JustifyContent;
  // Shorthand for justifyContent
  justify: JustifyContent;

  // Direction
  flexDirection: FlexDirection;
  // Shorthand for flexDirection
  flexDir: FlexDirection;
  // Shorthand for flexDirection
  dir: FlexDirection;

  // Wrap
  flexWrap: FlexWrap;
  // Shorthand for flexWrap
  wrap: FlexWrap;

  // Flex basis
  flexBasis: number;
  // Shorthand for flexBasis
  basis: number;

  // Grow & shrink
  flexGrow: number;
  // Shorthand for flexGrow
  grow: number;

  flexShrink: number;
  // Shorthand for flexShrink
  shrink: number;

  // Height & width
  height: Value;
  width: Value;
  maxHeight: Value;
  maxWidth: Value;
  minHeight: Value;
  minWidth: Value;

  // Padding
  padding: Value;
  // Shorthand for padding
  p: Value;

  paddingTop: Value;
  // Shorthand for paddingTop
  pt: Value;

  paddingBottom: Value;
  // Shorthand for paddingBottom
  pb: Value;

  paddingLeft: Value;
  // Shorthand for paddingLeft
  pl: Value;

  paddingRight: Value;
  // Shorthand for paddingRight
  pr: Value;

  // Margin
  margin: Value;
  // Shorthand for margin
  m: Value;

  marginTop: Value;
  // Shorthand for marginTop
  mt: Value;

  marginLeft: Value;
  // Shorthand for marginLeft
  ml: Value;

  marginRight: Value;
  // Shorthand for marginRight
  mr: Value;

  marginBottom: Value;
  // Shorthand for marginBottom
  mb: Value;
}>;

export const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

export const jsxPropToYogaProp = (s: string) => {
  return capitalize(camelCase(s));
};
export const setYogaProperties = (
  Yoga: Yoga,
  node: YGNode,
  props: R3FlexProps,
  scaleFactor: number
) => {
  return Object.keys(props).forEach((name) => {
    const value = props[name as keyof R3FlexProps];

    if (typeof value === "string") {
      switch (name) {
        case "flexDir":
        case "dir":
        case "flexDirection":
          return node.setFlexDirection(Yoga[`YGFlexDirection${jsxPropToYogaProp(value)}`]);
        case "align":
          node.setAlignItems(Yoga[`YGAlign${jsxPropToYogaProp(value)}`]);
          return node.setAlignContent(Yoga[`YGAlign${jsxPropToYogaProp(value)}`]);
        case "alignContent":
          return node.setAlignContent(Yoga[`YGAlign${jsxPropToYogaProp(value)}`]);
        case "alignItems":
          return node.setAlignItems(Yoga[`YGAlign${jsxPropToYogaProp(value)}`]);
        case "alignSelf":
          return node.setAlignSelf(Yoga[`YGAlign${jsxPropToYogaProp(value)}`]);
        case "justify":
        case "justifyContent":
          return node.setJustifyContent(Yoga[`YGJustify${jsxPropToYogaProp(value)}`]);
        case "wrap":
        case "flexWrap":
          return node.setFlexWrap(Yoga[`YGWrap${jsxPropToYogaProp(value)}`]);
        case "basis":
        case "flexBasis":
          return value === "auto"
            ? node.setFlexBasisAuto()
            : value.endsWith("%")
            ? node.setFlexBasisPercent(parseInt(value))
            : node.setFlexBasis(parseInt(value));

        default:
          return node[`set${capitalize(name)}`](value);
      }
    } else if (typeof value === "number") {
      const scaledValue = value * scaleFactor;
      switch (name) {
        case "basis":
        case "flexBasis":
          return node.setFlexBasis(scaledValue);
        case "grow":
        case "flexGrow":
          return node.setFlexGrow(scaledValue);
        case "shrink":
        case "flexShrink":
          return node.setFlexShrink(scaledValue);
        case "align":
          return node.setAlignItems(value as any);
        case "justify":
          return node.setJustifyContent(value as any);
        case "flexDir":
        case "dir":
          return node.setFlexDirection(value as any);
        case "wrap":
          return node.setFlexWrap(value as any);
        case "padding":
        case "p":
          return node.setPadding(Yoga.YGEdgeAll, scaledValue);
        case "paddingLeft":
        case "pl":
          return node.setPadding(Yoga.YGEdgeLeft, scaledValue);
        case "paddingRight":
        case "pr":
          return node.setPadding(Yoga.YGEdgeRight, scaledValue);
        case "paddingTop":
        case "pt":
          return node.setPadding(Yoga.YGEdgeTop, scaledValue);
        case "paddingBottom":
        case "pb":
          return node.setPadding(Yoga.YGEdgeBottom, scaledValue);

        case "margin":
        case "m":
          return node.setMargin(Yoga.YGEdgeAll, scaledValue);
        case "marginLeft":
        case "ml":
          return node.setMargin(Yoga.YGEdgeLeft, scaledValue);
        case "marginRight":
        case "mr":
          return node.setMargin(Yoga.YGEdgeRight, scaledValue);
        case "marginTop":
        case "mt":
          return node.setMargin(Yoga.YGEdgeTop, scaledValue);
        case "marginBottom":
        case "mb":
          return node.setMargin(Yoga.YGEdgeBottom, scaledValue);

        default:
          return node[`set${capitalize(name)}`](scaledValue);
      }
    }
  });
};

export type FlexCustomProps = Partial<{
  /**
   * Root container position
   */
  size: [number, number, number];
  yogaDirection: FlexYogaDirection;
  plane: FlexPlane;
  scaleFactor?: number;
  onReflow?: (totalWidth: number, totalHeight: number) => void;
  disableSizeRecalc?: boolean;
  /** Centers flex container in position.
   *
   * !NB center is based on provided flex size, not on the actual content */
  centerAnchor?: boolean;
  invalidate?: () => any;
}>;
export type FlexCustomFullProps = Omit<FlexCustomProps, "yogaDirection"> & {
  yogaDirection: YGDirection;
  flexWidth: number;
  flexHeight: number;
};
