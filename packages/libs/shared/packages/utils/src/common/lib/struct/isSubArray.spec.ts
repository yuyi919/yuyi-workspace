import { isSubArray } from "./isSubArray";

test("isSubArray", () => {
  expect(isSubArray([1, 2, 3], [1, 2])).toBeTruthy();
  expect(isSubArray([1, 2, 3], [1, 2, 3])).toBeTruthy();
  expect(isSubArray([1, 2], [1, 2, 3])).toBeFalsy();
  expect(isSubArray([1, 2, 3], [1, 2, 4])).toBeFalsy();
  expect(isSubArray([1, 2, 3], [1, 2, 3], true)).toBeFalsy();
});
