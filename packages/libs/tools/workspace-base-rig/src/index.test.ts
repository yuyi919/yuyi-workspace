import { loadRushPackages } from "./util";

describe("main", () => {
  it("test", () => {
    const { path, generator } = loadRushPackages();
    const names: string[] = ["@yuyi919/shared"];
    for (const { packageName, projectRelativeFolder, packageJsonEditor } of generator()) {
      // if ([...projectRelativeFolder.matchAll(/packages/gi)].length === 1) {
      //   console.log(path, packageName, projectRelativeFolder);
      // }
      if (packageJsonEditor.saveToObject().scripts?.docs) {
        console.log(path, packageName, projectRelativeFolder);
      }
    }
  });
});
