import { isEsModule, isEsModuleWithDefaultExport } from "./module";
import * as Module from "..";
import { hasOwnKey } from "./object";

describe("isEsModule", () => {
  it("test", () => {
    expect(isEsModule(Module)).toBeTruthy();
  });

  it("hasOwnKey", () => {
    hasOwnKey(Module, "default");
  });
  it("test default export", () => {
    expect(isEsModuleWithDefaultExport(Module)).toBeTruthy();
  });
});
