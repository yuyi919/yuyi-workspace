import { setupMain, BotConfig } from "./parser";

describe("setupParser", () => {
  it("common", async () => {
    const [Main, { config }] = setupMain({
      bot: BotConfig
    });
    await Main
  });
});
