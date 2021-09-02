import { nodeSharedLogger } from "./logger";

describe("nodeSharedLogger", () => {
  it("should work", () => {
    expect(nodeSharedLogger()).toEqual("node-shared-logger");
  });
});
