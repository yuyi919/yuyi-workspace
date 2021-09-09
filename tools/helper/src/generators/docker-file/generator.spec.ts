import { createTreeWithEmptyWorkspace } from "@nrwl/devkit/testing";
import { Tree, readProjectConfiguration } from "@nrwl/devkit";
//@ts-ignore
import generator from "./generator";
import { DockerFileGeneratorSchema } from "./schema";

describe("DockerFile generator", () => {
  let appTree: Tree;
  //@ts-ignore
  const options: DockerFileGeneratorSchema = { name: "test" };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it("should run successfully", async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, "test");
    expect(config).toBeDefined();
  });
});
