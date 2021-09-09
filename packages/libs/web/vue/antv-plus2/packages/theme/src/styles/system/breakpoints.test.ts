import { breakpoints } from "./breakpoints";
import { style } from "./style";

const textColor = style({
  prop: "color",
  themeKey: "palette",
});

describe("breakpoints", () => {
  it("should work", () => {
    const palette = breakpoints(textColor);
    expect(palette.filterProps.length).toEqual(6);
    expect(
      palette({
        color: "red",
        sm: {
          color: "blue",
        },
        theme: {},
      })
    ).toStrictEqual({
      color: "red",
      "@media (min-width:600px)": {
        color: "blue",
      },
    });
  });
});
