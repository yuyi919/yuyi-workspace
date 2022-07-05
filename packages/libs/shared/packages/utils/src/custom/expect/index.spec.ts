import { expect$ } from ".";
describe("test", () => {
  it("base", () => {
    expect([
      expect$.is.bool(true),
      expect$.is.bool(false),
      expect$.is.bool(Boolean("true")),
      expect$.is.not.bool(Boolean("true"))
    ]).toMatchInlineSnapshot(`
      Array [
        true,
        true,
        true,
        false,
      ]
    `);
  });
  it("filter", () => {
    expect([
      expect$.is.NaN.filter(2, NaN),
      expect$.is.bool.filter(Number("2") as any, void 0, false),
      expect$.is.bool.num.filter(Number("2") as any, void 0, false),
      expect$({
        num(t) {
          return typeof t === "boolean";
        }
      }).bool.num.filter(Number("2") as any, void 0, false)
    ]).toMatchInlineSnapshot(`
      Array [
        NaN,
        false,
        2,
        false,
      ]
    `);
  });
});
