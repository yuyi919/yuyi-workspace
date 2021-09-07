import { createTreeWithEmptyWorkspace } from "@nrwl/devkit/testing";
import { Tree, readProjectConfiguration } from "@nrwl/devkit";

import generator from "./generator";
import { FormatGeneratorSchema } from "./schema";

describe("format generator", () => {
  let appTree: Tree;
  const options = { project: "shared" } as FormatGeneratorSchema;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace(2);
  });

  it("should run successfully", async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, "test");
    expect(config).toBeDefined();
  });
});
