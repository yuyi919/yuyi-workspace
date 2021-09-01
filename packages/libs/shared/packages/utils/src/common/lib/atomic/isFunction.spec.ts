/* eslint-disable @typescript-eslint/no-empty-function */
import { isFunction, isFunctionLodash } from "./isFunction";

describe("isFunction", () => {
  it("isFunction", () => {
    expect(isFunction instanceof Function).toBe(true);
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(new Function())).toBe(true);
  });
  it("isFunctionLodash", () => {
    expect(isFunctionLodash instanceof Function).toBe(true);
    expect(isFunctionLodash(() => {})).toBe(true);
    expect(isFunctionLodash(new Function())).toBe(true);
  });
});
