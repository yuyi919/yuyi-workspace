import { mergePercent } from "./mergePercent";

test("merge", () => {
  expect(mergePercent(0.4, 0.9)).toBe(0.36);
  expect(mergePercent(0.499, 0.9)).toBe((50 * 90) / 10000);
});
