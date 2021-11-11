import {
  BaseExpression,
  BaseNodeData,
  createKindNodeFactory,
  ExpressionKind,
  NodeTypeKind,
  Source,
} from ".";

export type CommentBlock = SingleCommentNodeData | MultiCommentNodeData;
export type CommentNodeData = InlineCommentNodeData | SingleCommentNodeData | MultiCommentNodeData;
enum CommentKind {
  Single
}
export interface SingleCommentNodeData extends BaseNodeData<NodeTypeKind.Comment, CommentKind.Single> {
  value: string;
}

export interface MultiCommentNodeData
  extends BaseNodeData<NodeTypeKind.Comment, CommentKind.Single> {
  value: string[];
}

export interface InlineCommentNodeData extends BaseExpression {
  kind: ExpressionKind.Comment;
  sourceString: string;
  value: string;
}
const createCommentNode = createKindNodeFactory(NodeTypeKind.Comment, CommentKind);

export function createComment(comment: string, source?: Source) {
  return createCommentNode(
    CommentKind.Single,
    {
      value: comment,
    },
    source
  ) as SingleCommentNodeData;
}
