const Benchmark = require("benchmark");
const { camelCase } = require("..");
const { camelCase: camelCase2 } = require("lodash");
// add tests
var a = new Promise((r) => []);
const str = "a-b-c-d-e";
const runner = () => {
  return new Promise((r) => {
    const suite = new Benchmark.Suite();
    suite
      // .add("plus", () => {
      //   var b = typeof a === 'object',
      //     c = typeof a === 'object';
      //   d = typeof a === 'object';
      // })
      // .add("self", () => {
      //   var t;
      //   var b = ((t = typeof a) === 'object'),
      //     c = t === 'object';
      //   d = t === 'object';
      // })
      .add("camelCase", () => {
        camelCase("a-b-c-d-e");
      })
      .add("camelCase:lodash", () => {
        camelCase2("a-b-c-d-e");
      })
      // 监听每个事件完成后的输出
      .on("cycle", (event) => {
        console.log("run", String(event.target));
      })
      .on("complete", function (f) {
        console.log("Fastest is " + this.filter("fastest").map("name"));
        r();
      })
      // run async
      .run({ async: true });
  });
};

(async () => {
  for (const i of [1, 2, 3]) {
    await runner();
  }
})();
