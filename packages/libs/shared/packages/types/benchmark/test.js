const Benchmark = require("benchmark");
const { isPromise, isThenable } = require("..");
// add tests
var a = new Promise((r) => []);

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
      .add("isPromise", () => {
        !!a;
      })
      .add("isThenable", () => {
        a !== null;
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
