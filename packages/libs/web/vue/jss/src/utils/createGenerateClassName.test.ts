//@ts-nocheck
import { createGenerateClassName, nested } from "./createGenerateClassName";

describe("createGenerateClassName", () => {
  it("should generate a class name", () => {
    const generateClassName = createGenerateClassName();
    expect(
      generateClassName(
        {
          key: "key",
        },
        {
          options: {
            theme: {},
            classNamePrefix: "p",
          },
        }
      )
    ).toBe("p-key-1");
  });

  it("should increase the counter", () => {
    const generateClassName = createGenerateClassName();
    expect(
      generateClassName(
        {
          key: "key",
        },
        {
          options: {
            classNamePrefix: "p",
          },
        }
      )
    ).toBe("p-key-1");
    expect(
      generateClassName(
        {
          key: "key",
        },
        {
          options: {
            classNamePrefix: "p",
          },
        }
      )
    ).toBe("p-key-2");
  });

  it("should work without a classNamePrefix", () => {
    const generateClassName = createGenerateClassName();
    expect(
      generateClassName(
        { key: "root" },
        {
          options: {},
        }
      )
    ).toBe("root-1");
  });

  it("should generate global class names", () => {
    const generateClassName = createGenerateClassName();
    expect(
      generateClassName(
        { key: "root" },
        {
          options: {
            name: "CButton",
            theme: {},
          },
        }
      )
    ).toBe("CButton-root");
    expect(
      generateClassName(
        { key: "root" },
        {
          options: {
            name: "CButton",
            theme: {
              [nested]: true,
            },
          },
        }
      )
    ).toBe("CButton-root-1");
    expect(
      generateClassName(
        { key: "root" },
        {
          options: {
            name: "CButton",
            theme: {
              [nested]: true,
            },
          },
        }
      )
    ).toBe("CButton-root-2");
    expect(
      generateClassName(
        { key: "disabled" },
        {
          options: {
            name: "CButton",
            theme: {},
          },
        }
      )
    ).toBe("g-disabled");
  });

  describe("production", () => {
    let nodeEnv;
    const env = process.env;

    beforeEach(function () {
      // Only run the test on node.
      if (!/jsdom/.test(window.navigator.userAgent)) {
        this.skip();
      }
      nodeEnv = env.NODE_ENV;
      env.NODE_ENV = "production";
    });

    afterEach(() => {
      env.NODE_ENV = nodeEnv;
    });

    it("should output a short representation", () => {
      const generateClassName = createGenerateClassName();
      expect(
        generateClassName(
          { key: "root" },
          {
            options: {},
          }
        )
      ).toBe("jss1");
    });

    it("should use the seed", () => {
      const generateClassName = createGenerateClassName({
        seed: "dark",
      });
      expect(
        generateClassName(
          { key: "root" },
          {
            options: {},
          }
        )
      ).toBe("dark-jss1");
    });
  });
});
