/* eslint-disable no-redeclare */
import { TreeNode as AntTreeNode } from "ant-design-vue/types/tree-node";
import { VCProps, VueComponent2 } from "@antv-plus2/helper";

export interface ITreeNodeProps extends VCProps<AntTreeNode, false> {}

export const TreeNode = AntTreeNode as unknown as VueComponent2<
  ITreeNodeProps,
  { change: any },
  {},
  {},
  typeof AntTreeNode
>;
export interface TreeNode extends InstanceType<typeof TreeNode> {}
