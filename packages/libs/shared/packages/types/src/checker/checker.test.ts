import { isEsModule, isEsModuleWithDefaultExport } from "../checker";
import { hasOwnKey } from "../namespaces/object";
import { getType, isArr, isEmpty, isNaN, isNil, isNull, isUndefined } from "./checker";
import * as Module from "./esmodule_with";
describe("getType", () => {
  it("toBeTruthy", () => {
    // @ts-expect-error
    expect(getType({} / 1)).toBe("NaN");
    expect(getType(NaN)).toBe("NaN");
    expect(getType("NaN")).toBe("string");
    expect(getType("")).toBe("string");
    expect(getType(0)).toBe("number");
    expect(getType(Infinity)).toBe("number");
    expect(getType(-Infinity)).toBe("number");
    expect(getType([])).toBe("array");
    class Array2 extends Array {
      length2 = 10;
    }
    expect(getType(new Array2())).toBe("array");
    expect(getType(new Int16Array())).toBe("TypedArray");
    expect(getType(BigInt(123))).toBe("bigint");
    expect(getType(/regexp/)).toBe("RegExp");
    expect(getType(new Date())).toBe("Date");
    expect(getType(new Error())).toBe("Error");
    expect(isArr(new Array2())).toBe(true);
  });
});
describe("isNaN", () => {
  it("toBeTruthy", () => {
    // @ts-expect-error
    expect(isNaN({} / 1)).toBeTruthy();
    expect(isNaN(NaN)).toBeTruthy();
  });
  it("toBeFalsy", () => {
    expect(isNaN(undefined)).toBeFalsy();
    expect(isNaN({})).toBeFalsy();
  });
});

describe("isEmpty", () => {
  it("isEmpty", () => {
    expect(isEmpty({})).toBeTruthy();
    expect(isEmpty([])).toBeTruthy();
    expect(isEmpty("")).toBeTruthy();
    expect(isEmpty("  ")).toBeTruthy();
    expect(isEmpty(0)).toBeTruthy();
  });
  it("toBeFalsy", () => {
    expect(isEmpty("a")).toBeFalsy();
    expect(isEmpty(false)).toBeFalsy();
    expect(isEmpty([1])).toBeFalsy();
    expect(
      isEmpty({
        get a() {
          return 1;
        }
      })
    ).toBeFalsy();
  });
});

describe("isNil(null/undefined)", () => {
  it("toBeTruthy", () => {
    expect(isNull(null)).toBeTruthy();
    expect(isUndefined(undefined)).toBeTruthy();
    expect(isNil(undefined)).toBeTruthy();
    expect(isNil(null)).toBeTruthy();
  });
  it("toBeFalsy", () => {
    expect(isNull(undefined)).toBeFalsy();
    expect(isUndefined(null)).toBeFalsy();
    expect(isNull(0)).toBeFalsy();
    expect(isUndefined(0)).toBeFalsy();
    expect(isNil(0)).toBeFalsy();
  });
});

describe("isEsModule", () => {
  it("hasOwnKey", () => {
    expect(hasOwnKey(Module, "default")).toBeTruthy();
  });
  it("test", () => {
    expect(isEsModule(Module)).toBeTruthy();
  });
  it("test default export", () => {
    expect(isEsModuleWithDefaultExport(Module)).toBeTruthy();
  });
});
