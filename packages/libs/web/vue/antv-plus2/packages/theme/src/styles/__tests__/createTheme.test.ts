import { deepOrange, green } from "../../colors";
import { createTheme, Theme } from "../createTheme";

describe("createTheme", () => {
  it("should have a palette", () => {
    const theme = createTheme();
    expect(typeof createTheme).toBe("function");
    expect(typeof theme.palette).toBe("object");
  });

  it("should have the custom palette", () => {
    const theme = createTheme({
      palette: { primary: { main: deepOrange[500] }, secondary: { main: green.A400 } },
    });
    expect(theme.palette.primary.main).toBe(deepOrange[500]);
    expect(theme.palette.secondary.main).toBe(green.A400);
  });

  it("should allow providing a partial structure", () => {
    const theme = createTheme({ transitions: { duration: { shortest: 150 } } });
    expect(theme.transitions.duration.shorter).not.toBe(undefined);
  });

  describe("shadows", () => {
    it("should provide the default array", () => {
      const theme = createTheme();
      expect(theme.shadows[2]).toBe(
        "0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)"
      );
    });

    it("should override the array as expected", () => {
      const shadows = [
        "none",
        1,
        1,
        1,
        2,
        3,
        3,
        4,
        5,
        5,
        6,
        6,
        7,
        7,
        7,
        8,
        8,
        8,
        9,
        9,
        10,
        10,
        10,
        11,
        11,
      ] as const;
      const theme = createTheme({ shadows });
      expect(theme.shadows).toBe(shadows);
    });
  });

  describe("components", () => {
    it("should have the components as expected", () => {
      const components = {
        MuiDialog: {
          defaultProps: {
            fullScreen: true,
            fullWidth: false,
          },
        },
        MuiButtonBase: {
          defaultProps: {
            disableRipple: true,
          },
        },
        MuiPopover: {
          defaultProps: {
            container: null, //document.createElement("div"),
          },
        },
      };
      const theme = createTheme({ components });
      expect(theme.components).toEqual(components);
    });
  });

  describe("styleOverrides", () => {
    it("should warn when trying to override an internal state the wrong way", () => {
      let theme: Theme = null as any;

      expect(() => {
        theme = createTheme({
          components: { Button: { styleOverrides: { disabled: { color: "blue" } } } },
        });
      }).not.toErrorDev();
      // @ts-expect-error
      expect(Object.keys(theme.components!.Button!.styleOverrides!.disabled).length).toBe(1);

      expect(() => {
        theme = createTheme({
          components: { MuiButton: { styleOverrides: { root: { color: "blue" } } } },
        });
      }).not.toErrorDev();

      expect(() => {
        theme = createTheme({
          components: { MuiButton: { styleOverrides: { disabled: { color: "blue" } } } },
        });
      }).toErrorDev(
        "Material-UI: The `MuiButton` component increases the CSS specificity of the `disabled` internal state."
      );
      expect(Object.keys(theme.components!.MuiButton!.styleOverrides!.disabled).length).toBe(0);

      expect(theme.components).toMatchSnapshot();
    });
  });

  it("shallow merges multiple arguments", () => {
    const theme = createTheme({ foo: "I am foo" }, { bar: "I am bar" });
    expect(theme.foo).toBe("I am foo");
    expect(theme.bar).toBe("I am bar");
  });

  it("deep merges multiple arguments", () => {
    const theme = createTheme({ custom: { foo: "I am foo" } }, { custom: { bar: "I am bar" } });
    expect(theme.custom.foo).toBe("I am foo");
    expect(theme.custom.bar).toBe("I am bar");
  });
});
