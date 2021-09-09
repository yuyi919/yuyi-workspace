import { generateUtilityClass } from "./generateUtilityClass";

describe("generateUtilityClass", () => {
  it("should generate the class correctly", () => {
    expect(generateUtilityClass("MuiTest", "slot")).toBe("MuiTest-slot");
  });

  it("should consider if slot should generate state class", () => {
    expect(generateUtilityClass("MuiTest", "active")).toBe("Mui-active");
    expect(generateUtilityClass("MuiTest", "checked")).toBe("Mui-checked");
    expect(generateUtilityClass("MuiTest", "disabled")).toBe("Mui-disabled");
    expect(generateUtilityClass("MuiTest", "error")).toBe("Mui-error");
    expect(generateUtilityClass("MuiTest", "focused")).toBe("Mui-focused");
    expect(generateUtilityClass("MuiTest", "focusVisible")).toBe("Mui-focusVisible");
    expect(generateUtilityClass("MuiTest", "required")).toBe("Mui-required");
    expect(generateUtilityClass("MuiTest", "expanded")).toBe("Mui-expanded");
    expect(generateUtilityClass("MuiTest", "selected")).toBe("Mui-selected");
  });
});
