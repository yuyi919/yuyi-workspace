import { nodeCliUtils } from "./cli-utils";

describe("nodeCliUtils", () => {
  it("should work", () => {
    expect(nodeCliUtils()).toEqual("node-cli-utils");
  });
});
