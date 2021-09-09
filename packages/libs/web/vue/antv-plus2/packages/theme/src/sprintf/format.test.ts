import { sprintf } from "./format";

describe("Basic Rendering", () => {
  it("Basic Rendering", () => {
    expect(sprintf(`测试: %s %1$#T %%%d 然后`, "你好", -100, 1, 3)).toBe(
      "测试: 你好 String %-100 然后 1 3"
    );
  });
});

describe("JS: Rendering", () => {
  test(`Rendering Boolean Values, 'y' and 'Y' conversions`, () => {
    expect(sprintf("%O", {})).toMatchInlineSnapshot(`"0"`);
    expect(sprintf("%+7d", -42)).toMatchInlineSnapshot(`"    -42"`);
    expect(sprintf("|%S|", 1, () => {})).toMatchInlineSnapshot(`"|1| () => { }"`);
    expect(sprintf("|%1$y|%2$Y|%1$#Y|%2$#y|%2$.1y|", 1, 0)).toBe("|true|FALSE|YES|no|f|");
    expect(sprintf("|%05.2Y|%-5.2y|", 1, 0)).toBe("|000TR|fa   |");
  });
  test(`Rendering JSON | 'J' conversion`, () => {
    const x = {
      a: [1, [2, 3, 4], 5, 6, 7],
      b: {
        c: {
          d: { e: "f" },
          g: "h",
          i: "j",
        },
        k: "l",
        m: "n",
        o: "p",
      },
      q: "r",
    };
    expect(sprintf("%1$J", x)).toMatchSnapshot();
    expect(sprintf("%1$#J", x)).toMatchSnapshot();
  });
  it(`JS typeof, 'T' conversion`, () => {
    expect(sprintf("%1$T %#T", 1)).toBe("number Number");
    expect(sprintf("%T %1$#T", "foo")).toBe("string String");
    expect(sprintf("%T %1$#T", [1, 2, 3])).toBe("object Array");
    expect(sprintf("%T %1$#T", null)).toBe("object Null");
    expect(sprintf("%T %1$#T", undefined)).toBe("undefined Undefined");
  });
  it(`JS valueOf, 'V' conversion`, () => {
    const toString = () => '"string"';
    const valueOf = () => 3;
    expect(sprintf("%1$d %1$s %1$V", { toString })).toBe('0 "string" "string"');
    expect(sprintf("%1$d %1$s %1$V", { valueOf })).toBe("3 [object Object] 3");
    expect(sprintf("%1$d %1$s %1$V", { valueOf, [Symbol.toStringTag]: "Fake" })).toBe(
      "3 [object Fake] 3"
    );
    expect(sprintf("%1$d %1$s %1$V", { valueOf, toString })).toBe('3 "string" 3');
  });
});
