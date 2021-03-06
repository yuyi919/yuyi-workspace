import style from "./style";

describe("style", () => {
  const bgcolor = style({
    prop: "bgcolor",
    cssProperty: "backgroundColor",
    themeKey: "palette",
  });

  it("should work", () => {
    const output = bgcolor({
      bgcolor: "blue",
    });
    expect(output).toEqual({
      backgroundColor: "blue",
    });
  });

  it("should support breakpoints", () => {
    const output1 = bgcolor({
      bgcolor: ["blue", "red"],
    });
    expect(output1).toEqual({
      "@media (min-width:0px)": {
        backgroundColor: "blue",
      },
      "@media (min-width:600px)": {
        backgroundColor: "red",
      },
    });

    const output2 = bgcolor({
      bgcolor: {
        xs: "blue",
        sm: "red",
      },
    });
    expect(output2).toEqual({
      "@media (min-width:0px)": {
        backgroundColor: "blue",
      },
      "@media (min-width:600px)": {
        backgroundColor: "red",
      },
    });
  });

  const boxShadow = style({
    prop: "boxShadow",
    themeKey: "shadows",
  });

  it("should support array theme value", () => {
    const output = boxShadow({
      theme: {
        shadows: ["none", "0px 1px 3px 0px rgba(0, 0, 0, 0.2)"],
      },
      boxShadow: 1,
    });

    expect(output).toEqual({
      boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.2)",
    });
  });

  it("should fallback to value if theme value is an array and index missing", () => {
    const output = boxShadow({
      theme: {
        shadows: ["none"],
      },
      boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.2)",
    });

    expect(output).toEqual({
      boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.2)",
    });
  });

  const border = style({
    prop: "border",
    themeKey: "borders",
    transform: (value) => (typeof value === "number" && value > 0 ? `${value}px solid` : value),
  });

  it("should transform the prop correctly", () => {
    const output1 = border({
      border: 1,
    });
    expect(output1).toEqual({
      border: "1px solid",
    });

    const output2 = border({
      theme: {
        borders: {
          small: 2,
        },
      },
      border: "small",
    });
    expect(output2).toEqual({
      border: "2px solid",
    });

    const output3 = border({
      theme: {
        borders: (value) => `${value ** 2}px solid`,
      },
      border: 2,
    });
    expect(output3).toEqual({
      border: "4px solid",
    });
  });

  it("should transform the property correctly using theme", () => {
    const vSpacingWithTheme = style({
      prop: "vSpacing",
      cssProperty: false,
      themeKey: "spacing",
      transform: (value) => ({
        "& > :not(:last-child)": {
          marginBottom: value,
        },
      }),
    });

    const output = vSpacingWithTheme({
      theme: {
        spacing: (value) => value * 2,
      },
      vSpacing: 8,
    });

    expect(output).toEqual({
      "& > :not(:last-child)": {
        marginBottom: 16,
      },
    });
  });

  it("should fallback to composed theme keys", () => {
    const fontWeight = style({
      prop: "fontWeight",
      themeKey: "typography",
    });

    const output1 = fontWeight({
      theme: {
        typography: {
          fontWeightBold: 700,
        },
      },
      fontWeight: "bold",
    });
    expect(output1).toEqual({
      fontWeight: 700,
    });

    const output2 = fontWeight({
      theme: {
        typography: {
          fontWeight: 700,
        },
      },
      fontWeight: "default",
    });
    expect(output2).toEqual({
      fontWeight: 700,
    });
  });
});
