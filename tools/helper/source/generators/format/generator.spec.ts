import { createTreeWithEmptyWorkspace } from "@nrwl/devkit/testing";
import { Tree, readProjectConfiguration } from "@nrwl/devkit";

import generator from "./generator";
import { FormatGeneratorSchema } from "./schema";

describe("format generator", () => {
  let appTree: Tree;
  const options = { project: "test" } as FormatGeneratorSchema;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it("should run successfully", async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, "test");
    expect(config).toBeDefined();
  });
});
