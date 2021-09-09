import { getPath, unstable_capitalize as capitalize } from "./utils";
// import responsivePropType from "./responsivePropType";
import { handleBreakpoints } from "./breakpoints";
import { StyleFunction } from "./types";
import { CSSObject, CSSProperties } from "./createStyled";
import Types from "@yuyi919/shared-types";

export interface StyleOptions<PropKey> {
  cssProperty?: PropKey | keyof CSSProperties | false;
  prop: PropKey;
  /**
   * dot access in `Theme`
   */
  themeKey?: string;
  transform?: (cssValue: unknown) => number | string | CSSProperties | CSSObject;
}

function getValue(
  themeMapping: any[] | ((key?: string | number) => any),
  transform?: (cssValue: any) => any,
  propValueFinal?: string,
  userValue = propValueFinal
) {
  let value;

  if (typeof themeMapping === "function") {
    value = themeMapping(propValueFinal);
  } else if (Array.isArray(themeMapping)) {
    value = themeMapping[propValueFinal as unknown as number] || userValue;
  } else {
    value = getPath(themeMapping, propValueFinal) || userValue;
  }
  if (transform) {
    value = transform(value);
  }
  return value;
}

export function style<PropKey extends string, Theme extends object>(
  options: StyleOptions<PropKey>
): StyleFunction<{ [K in PropKey]?: unknown } & { theme: Theme }> {
  const { prop, cssProperty = options.prop, themeKey, transform } = options;

  const fn = (props: Types.Recordable) => {
    if (props[prop] == null) {
      return null;
    }

    const propValue = props[prop];
    const theme = props.theme;
    const themeMapping = getPath(theme, themeKey) || {};
    const styleFromPropValue = (propValueFinal: any) => {
      let value = getValue(themeMapping, transform, propValueFinal);

      if (propValueFinal === value && typeof propValueFinal === "string") {
        // Haven't found value
        value = getValue(
          themeMapping,
          transform,
          `${prop}${propValueFinal === "default" ? "" : capitalize(propValueFinal)}`,
          propValueFinal
        );
      }

      if (cssProperty === false) {
        return value;
      }

      return {
        [cssProperty]: value,
      };
    };

    return handleBreakpoints(props, propValue, styleFromPropValue);
  };

  // fn.propTypes =
  //   process.env.NODE_ENV !== "production"
  //     ? {
  //         [prop]: responsivePropType,
  //       }
  //     : {};

  fn.filterProps = [prop];

  return fn;
}
