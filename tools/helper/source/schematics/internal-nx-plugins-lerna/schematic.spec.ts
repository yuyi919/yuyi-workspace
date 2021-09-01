import { Tree } from "@angular-devkit/schematics";
import { SchematicTestRunner } from "@angular-devkit/schematics/testing";
import { createEmptyWorkspace } from "@nrwl/workspace/testing";
import { join } from "path";

import { Schema } from "./schema";

describe("internal-nx-plugins-lerna schematic", () => {
  let appTree: Tree;
  const options: Schema = { name: "test" } as any;

  const testRunner = new SchematicTestRunner(
    "@yuyi919/internal-nx-plugins-lerna",
    join(__dirname, "../../../collection.json")
  );

  beforeEach(() => {
    appTree = createEmptyWorkspace(Tree.empty());
  });

  it("should run successfully", async () => {
    await expect(
      testRunner.runSchematicAsync("internal-nx-plugins-lerna", options, appTree).toPromise()
    ).resolves.not.toThrowError();
  });
});
