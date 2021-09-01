import { isNumber, isNum } from "./isNumber";

describe("isNumber", () => {
  it("isNumber", () => {
    expect(isNumber instanceof Function).toBe(true);
    expect(isNumber("123")).toBe(false);
    expect(isNumber(Number(0))).toBe(true);
  });
});

const A = getExpectMap();
const B = getExpectMap(true);

describe("isNumber Auto Test", () => {
  A.forEach((r, v) => {
    it("isNumber Strict" + JSON.stringify(v) + "=" + r, () => {
      expect(isNumber(v)).toBe(r);
    });
  });
  B.forEach((r, v) => {
    it("isNumber" + JSON.stringify(v) + "=" + r, () => {
      expect(isNumber(v, true)).toBe(r);
    });
  });
});
describe("isNumber Auto Test", () => {
  A.forEach((r, v) => {
    it("isNumber Strict" + JSON.stringify(v) + "=" + r, () => {
      expect(isNum(v)).toBe(r);
    });
  });
  B.forEach((r, v) => {
    it("isNumber" + JSON.stringify(v) + "=" + r, () => {
      expect(isNum(v, true)).toBe(r);
    });
  });
});

function getExpectMap(allowNaN = false) {
  return new Map<any, any>([
    [{}, false],
    [[], false],
    [true, false],
    [false, false],
    ["", false],
    [0, true],
    [NaN, allowNaN],
    [undefined, false],
    [null, false],
    [Number(0), true],
  ]);
}
