import { getPath } from "../utils";

export type SpacingOptions =
  | number
  | Spacing
  | ((abs: number) => number | string)
  | ((abs: number | string) => number | string)
  | ReadonlyArray<string | number>;

export type SpacingArgument = number | string;

// The different signatures imply different meaning for their arguments that can't be expressed structurally.
// We express the difference with variable names.
/* tslint:disable:unified-signatures */
export interface Spacing {
  (): string;
  (value: number): string;
  (topBottom: SpacingArgument, rightLeft: SpacingArgument): string;
  (top: SpacingArgument, rightLeft: SpacingArgument, bottom: SpacingArgument): string;
  (
    top: SpacingArgument,
    right: SpacingArgument,
    bottom: SpacingArgument,
    left: SpacingArgument
  ): string;
}
/* tslint:enable:unified-signatures */

export function createUnaryUnit<Spacing extends SpacingOptions>(
  theme: { spacing: Spacing },
  themeKey?: string,
  defaultValue?: any,
  propName?: string
) {
  const themeSpacing = getPath(theme, themeKey) || defaultValue;

  if (typeof themeSpacing === "number") {
    return (abs: string | number) => {
      if (typeof abs === "string") {
        return abs;
      }

      if (process.env.NODE_ENV !== "production") {
        if (typeof abs !== "number") {
          console.error(
            `Material-UI: Expected ${propName} argument to be a number or a string, got ${abs}.`
          );
        }
      }
      return themeSpacing * abs;
    };
  }

  if (Array.isArray(themeSpacing)) {
    return (abs: string | number) => {
      if (typeof abs === "string") {
        return abs;
      }

      if (process.env.NODE_ENV !== "production") {
        if (!Number.isInteger(abs)) {
          console.error(
            [
              `Material-UI: The \`theme.${themeKey}\` array type cannot be combined with non integer values.` +
                `You should either use an integer value that can be used as index, or define the \`theme.${themeKey}\` as a number.`,
            ].join("\n")
          );
        } else if (abs > themeSpacing.length - 1) {
          console.error(
            [
              `Material-UI: The value provided (${abs}) overflows.`,
              `The supported values are: ${JSON.stringify(themeSpacing)}.`,
              `${abs} > ${themeSpacing.length - 1}, you need to add the missing values.`,
            ].join("\n")
          );
        }
      }

      return themeSpacing[abs];
    };
  }

  if (typeof themeSpacing === "function") {
    return themeSpacing;
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(
      [
        `Material-UI: The \`theme.${themeKey}\` value (${themeSpacing}) is invalid.`,
        "It should be a number, an array or a function.",
      ].join("\n")
    );
  }

  return () => undefined;
}

export function createUnarySpacing<Spacing extends SpacingOptions>(theme: {
  spacing: Spacing;
}): Spacing extends number
  ? (abs: number | string) => number | number
  : Spacing extends any[]
  ? <Index extends number>(abs: Index | string) => Spacing[Index] | string
  : Spacing extends (...args: unknown[]) => unknown
  ? Spacing
  : // warns in Dev
    () => undefined {
  return createUnaryUnit(theme, "spacing", 8, "spacing");
}
export function createSpacing(spacingInput: SpacingOptions = 8): Spacing {
  // Already transformed.
  if ((spacingInput as any).mui) {
    return spacingInput as Spacing;
  }

  // Material Design layouts are visually balanced. Most measurements align to an 8dp grid, which aligns both spacing and the overall layout.
  // Smaller components, such as icons, can align to a 4dp grid.
  // https://material.io/design/layout/understanding-layout.html#usage
  const transform = createUnarySpacing({
    spacing: spacingInput,
  });

  const spacing = (...argsInput: ReadonlyArray<number | string>): string => {
    if (process.env.NODE_ENV !== "production") {
      if (!(argsInput.length <= 4)) {
        console.error(
          `Material-UI: Too many arguments provided, expected between 0 and 4, got ${argsInput.length}`
        );
      }
    }

    const args = argsInput.length === 0 ? [1] : argsInput;

    return args
      .map((argument) => {
        const output = transform(argument);
        return typeof output === "number" ? `${output}px` : output;
      })
      .join(" ");
  };

  spacing.mui = true;

  return spacing;
}
