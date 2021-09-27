import { sharedPackagesLogger } from "./logger";

describe("sharedPackagesLogger", () => {
  it("should work", () => {
    expect(sharedPackagesLogger()).toEqual("shared-packages-logger");
  });
});
