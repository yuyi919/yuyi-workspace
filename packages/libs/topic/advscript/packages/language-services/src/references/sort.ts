import { relative } from "path";

export function compareWithRelativePath(pathA: string, pathB: string, target: string) {
  if (pathA === pathB) return 0;
  const aRelativeUri = relative(target, pathA);
  const bRelativeUri = relative(target, pathB);
  // console.log("compareWithRelativePath", pathA, pathB);
  if (aRelativeUri === bRelativeUri) return 0;
  const reg = /\/|\.\./g;
  const aUriLengths = aRelativeUri.split(reg);
  const bUriLengths = bRelativeUri.split(reg);
  const lineDiff = aUriLengths.length - bUriLengths.length;
  return lineDiff === 0 ? aRelativeUri.localeCompare(bRelativeUri) : lineDiff;
}

// console.log(
//   ["c:/a/c/b.doc", "c:/a/a.doc", "c:/aoo.doc", "c:/a/a.co"].sort((a, b) =>
//     compareWithRelativePath(a, b, "c:/a/app.txt")
//   )
// );

export function compareWithLogic<T>(a: T, b: T, handle: (target: T) => boolean) {
  return compareWithTrue(handle(a), handle(b));
}
export function compareWithConst<T>(a: T, b: T, target: T) {
  return compareWithTrue(a === target, b === target);
}
export function compareWithObjectNotNil<T>(a: T, b: T) {
  return compareWithFalse(!a, !b); //,  Number(!a) - Number(!b); // true:1 false:0, 相减为-1则交换顺序;
}
export function compareWithNotNil<T>(a: T, b: T) {
  // eslint-disable-next-line eqeqeq
  return compareWithLogic(a, b, (target) => target != null); //,  Number(!a) - Number(!b); // true:1 false:0, 相减为-1则交换顺序;
}
export function compareWithTrue(a: boolean, b: boolean) {
  if (a && b) return true;
  return Number(b) - Number(a); // true:1 false:0, 相减为-1则交换顺序;
}
export function compareWithFalse(a: boolean, b: boolean) {
  if (!a && !b) return true;
  return Number(a) - Number(b); // true:1 false:0, 相减为-1则交换顺序;
}
export function compareWithNumber(a: number, b: number) {
  return b - a;
}
