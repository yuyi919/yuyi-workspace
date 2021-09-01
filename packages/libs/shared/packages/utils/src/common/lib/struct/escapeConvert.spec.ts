import { PathEscapeConvert } from "./escapeConvert";

describe("PathEscapeConvert", () => {
  it("base", () => {
    expect(PathEscapeConvert.escapePath("a.b")).toBe("a$_$b");
    expect(PathEscapeConvert.extractPath("a$_$b")).toBe("a.b");
    expect(PathEscapeConvert.extendsEscapedPath("$_$a", "b$_$c")).toMatchInlineSnapshot(`"b$_$a"`);
    expect(PathEscapeConvert.escapePath.toString()).toMatchInlineSnapshot(
      `"function () { [native code] }"`
    );
  });
  it("custom", () => {
    const custom = PathEscapeConvert.create("||");
    expect(custom === PathEscapeConvert).toBe(false);
    expect("create" in custom).toBe(false);
    expect(custom.escapePath === PathEscapeConvert.escapePath).toBe(false);
    expect(custom.escapePath("a.b")).toBe("a||b");
    expect(custom.extractPath("a||b")).toBe("a.b");
    expect(Object.keys(custom)).toMatchInlineSnapshot(`Array []`);
    expect(Object.getOwnPropertyNames(custom)).toMatchInlineSnapshot(`
      Array [
        "_safeSplitStr",
        "_splitStr",
        "escapePath",
        "extractPath",
        "extendsEscapedPath",
      ]
    `);
  });
  it("custom 2", () => {
    const custom = PathEscapeConvert.create("|_|");
    expect(custom === PathEscapeConvert).toBe(false);
    expect(custom.escapePath("a.b")).toBe("a|_|b");
    expect(custom.extractPath("a|_|b")).toBe("a.b");
    expect(custom.extendsEscapedPath("|_|a", "b|_|c")).toMatchInlineSnapshot(`"b|_|a"`);
  });
});
