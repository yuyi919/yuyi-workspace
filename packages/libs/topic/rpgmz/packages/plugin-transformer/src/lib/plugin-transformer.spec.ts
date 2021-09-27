import { topicRpgmzPackagesPluginTransformer } from "./plugin-transformer";

describe("topicRpgmzPackagesPluginTransformer", () => {
  it("should work", () => {
    expect(topicRpgmzPackagesPluginTransformer()).toEqual(
      "topic-rpgmz-packages-plugin-transformer"
    );
  });
});
