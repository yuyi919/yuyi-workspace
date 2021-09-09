import { resolve } from "path";
mockWorkspaceRoot(resolve("../../packages"));
import { getProjectGraphWith, getProjectGraph } from "./graph";

test("get graph", () => {
  const graph = getProjectGraph();
  const graphWith = getProjectGraphWith(resolve("../../packages"));
  expect(graph).toEqual(graphWith);
  expect(graph.nodes).toMatchSnapshot()
});

function mockWorkspaceRoot(appRootPath: string) {
  jest.mock("@nrwl/tao/src/utils/app-root", () => ({
    get appRootPath() {
      return appRootPath;
    },
  }));
}
