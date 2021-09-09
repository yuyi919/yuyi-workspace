import { createTreeWithEmptyWorkspace } from "@nrwl/devkit/testing";
import { Tree, readProjectConfiguration } from "@nrwl/devkit";

import generator from "./generator";
import { Schema as ToolsNxPluginWorkspaceHelperGeneratorSchema } from "./schema";

describe("tools-nx-plugin-workspace-helper generator", () => {
  let appTree: Tree;
  const options: ToolsNxPluginWorkspaceHelperGeneratorSchema = { name: "test", builder: "tsc" };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it("should run successfully", async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, "test");
    expect(config).toBeDefined();
  });
});
