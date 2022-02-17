/* eslint-disable no-redeclare */
import { Tree as AntTree } from "ant-design-vue";
import { TreeNodeValue } from "ant-design-vue/types/tree-select";
import { VCProps, VueComponent2 } from "@antv-plus2/helper";
import { TreeNode } from "./TreeNode";

export interface ITreeProps extends Omit<VCProps<AntTree, false>, "blur" | "focus"> {}
export interface ITreeEvents {
  change: TreeNodeValue;
  blur: MouseEvent;
  focus: MouseEvent;
}
export interface ITreeScopedSlots {}
export interface ITreePublic {}

export const Tree = AntTree as unknown as VueComponent2<
  ITreeProps,
  ITreeEvents,
  ITreeScopedSlots,
  ITreePublic,
  typeof AntTree & {
    TreeNode: typeof TreeNode;
  }
>;

export interface Tree extends InstanceType<typeof Tree> {}
export { AntTree };
