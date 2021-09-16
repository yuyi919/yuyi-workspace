import { GenerateId } from "jss";

const hasSymbol = typeof Symbol === "function" && Symbol.for;
export const nested = hasSymbol ? Symbol.for("mui.nested") : "__THEME_NESTED__";

export interface GenerateClassNameOptions {
  /**
   * 全局样式(无类名计数)
   * @default false
   */
  global?: boolean;
  /**
   * 添加生产前缀
   * @default "jss"
   */
  productionPrefix?: string;
  /**
   * 添加通用前缀
   */
  seed?: string;
}

/**
 * This is the list of the style rule name we use as drop in replacement for the built-in
 * pseudo classes (:checked, :disabled, :focused, etc.).
 *
 * Why do they exist in the first place?
 * These classes are used at a specificity of 2.
 * It allows them to override previously defined styles as well as
 * being untouched by simple user overrides.
 */
const staticClasses = [
  "checked",
  "disabled",
  "error",
  "focused",
  "focusVisible",
  "required",
  "expanded",
  "selected",
];

declare module "jss" {
  interface StyleSheetFactoryOptions {
    name?: string;
    theme?: any;
  }
}

// Returns a function which generates unique class names based on counters.
// When new generator function is created, rule counter is reset.
// We need to reset the rule counter for SSR for each request.
//
// It's inspired by
// https://github.com/cssinjs/jss/blob/4e6a05dd3f7b6572fdd3ab216861d9e446c20331/src/utils/createGenerateClassName.js
export function createGenerateClassName(options?: GenerateClassNameOptions): GenerateId {
  options = options || {};
  const { global, productionPrefix = "jss", seed = "" } = options;
  const seedPrefix = seed === "" ? "" : `${seed}-`;
  let ruleCounter = 0;
  const isProd = process.env.NODE_ENV === "production";
  const getNextCounterId = global
    ? () => ""
    : () => {
        ruleCounter += 1;
        if (!isProd) {
          if (ruleCounter >= 1e10) {
            console.warn(
              [
                "Material-UI: You might have a memory leak.",
                "The ruleCounter is not supposed to grow that much.",
              ].join("")
            );
          }
        }
        return isProd ? ruleCounter : "-" + ruleCounter;
      };

  return (rule, { options }) => {
    const name = options.name;
    // Is a global static MUI style?
    if (name?.length > 0 && !options.link && global !== false) {
      // We can use a shorthand class name, we never use the keys to style the components.
      if (staticClasses?.indexOf(rule.key) !== -1) {
        return `${seedPrefix}${options.classNamePrefix || "g"}-${rule.key}`;
      }

      const prefix = `${seedPrefix}${name}-${rule.key}`;

      if (!options.theme?.[nested] || seed !== "") {
        return prefix;
      }

      return `${prefix}${getNextCounterId()}`;
    }

    if (isProd) {
      return `${seedPrefix}${productionPrefix}${getNextCounterId()}`;
    }

    const suffix = `${rule.key}${getNextCounterId()}`;

    // Help with debuggability.
    if (options.classNamePrefix) {
      return `${seedPrefix}${options.classNamePrefix}-${suffix}`;
    }

    return `${seedPrefix}${suffix}`;
  };
}
