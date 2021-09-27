import { autoExtendConstructor, safeExtendConstructor } from "./extendConstructor";

export * from "./extendConstructor";

export function examples() {
  function Test() {
    return (target: any) => {
      return autoExtendConstructor(
        safeExtendConstructor(
          target,
          (self, args) => {
            self.extendSafe = true;
            console.log("extendSafe", self, args);
          },
          (name) => `Safe${name}`
        ),
        (self, args) => {
          self.extendAuto = true;
          console.log("extendAuto", self, args);
        },
        (name) => `Auto${name}`
      );
    };
  }

  @Test()
  class TestCls {
    constructor(...args: any[]) {
      console.log(...args);
    }
  }

  console.log(new TestCls(1, 2, 3));
}
