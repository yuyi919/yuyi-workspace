import { NodeTypeKind } from ".";

export type CommentNodeData = SingleCommentNodeData | MultiCommentNodeData;
export interface SingleCommentNodeData {
  type: NodeTypeKind.Comment;
  value: string;
}

export interface MultiCommentNodeData {
  type: NodeTypeKind.Comment;
  value: string[];
}
