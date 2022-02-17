import { FlexPlane } from "./props";

const utils = {};
export function getFlex2DSize(sizes: [number, number, number], plane: FlexPlane) {
  switch (plane) {
    case "xy":
      return [sizes[0], sizes[1]];
    case "yz":
      return [sizes[1], sizes[2]];
    case "xz":
      return [sizes[0], sizes[2]];
  }
}
const getIsTopLevelChild = (node: YGNode) => !node.getParent()?.getParent();
/** @returns [mainAxisShift, crossAxisShift] */

export const getRootShift = (
  rootCenterAnchor: boolean | undefined,
  rootWidth: number,
  rootHeight: number,
  node: YGNode
) => {
  if (!rootCenterAnchor || !getIsTopLevelChild(node)) {
    return [0, 0];
  }
  const mainAxisShift = -rootWidth / 2;
  const crossAxisShift = -rootHeight / 2;
  return [mainAxisShift, crossAxisShift] as const;
};
export const rmUndefFromObj = (obj: Record<string, any>) => {
  for (const key in obj) {
    obj[key] === undefined && delete obj[key];
  }
};
