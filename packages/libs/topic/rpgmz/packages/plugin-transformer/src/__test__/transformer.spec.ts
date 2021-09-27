import { transform } from "../transformCode";
import { normlize } from "../rollupPlugin";

describe("test", () => {
  it("test1", async () => {
    const { result, collect } = transform(require.resolve("../data.model"));
    const r = normlize(collect);
    console.log(result);
  });
  // it('test2', async () => {
  //   testEnv.transformCommonJS(require.resolve('./test2'));
  // });
});
