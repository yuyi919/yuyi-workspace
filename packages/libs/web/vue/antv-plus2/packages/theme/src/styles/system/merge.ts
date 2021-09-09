import { deepmerge } from "./utils";

export function merge(acc: any, item: any) {
  if (!item) {
    return acc;
  }
  return deepmerge(acc, item, {
    clone: false, // No need to clone deep, it's way faster.
  });
}
