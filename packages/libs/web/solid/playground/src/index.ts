export * from "./lib/playground";
@C
class A {}
console.log(A)

function C(target: any) {
  target.ccc = "a"
}
