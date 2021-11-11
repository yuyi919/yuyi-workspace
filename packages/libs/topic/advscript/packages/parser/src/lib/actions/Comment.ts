import {
  defineActions,
  ExpressionKind,
  InlineCommentNodeData,
  NodeTypeKind,
  SingleCommentNodeData,
  Node,
  createComment,
} from "../interface";
import { toSource } from "./_util";

export const Comment = defineActions<SingleCommentNodeData | InlineCommentNodeData>({
  comment_single(text) {
    return createComment(text.parse(), toSource(text));
  },
  comment_multi(text) {
    return createComment(text.parse(), toSource(text));
  },
  // Comment_single(head, text): SingleCommentNodeData {
  //   return {
  //     type: NodeTypeKind.Comment,
  //     kind: ExpressionKind.Comment,
  //     value: text.parse(),
  //   };
  // },
  // Comment_multi(head, text, foot) {
  //   // console.log(text.parse());
  //   return {
  //     type: NodeTypeKind.Comment,
  //     value: text.parse(),
  //   };
  // },
  comment_notes(comment: Node<InlineCommentNodeData>): SingleCommentNodeData {
    return createComment(comment.parse().value, toSource(comment));
  },
  comment_inline(text): InlineCommentNodeData {
    const value = text.parse();
    return {
      type: NodeTypeKind.Expression,
      kind: ExpressionKind.Comment,
      kindName: ExpressionKind[ExpressionKind.Comment],
      sourceString: text.sourceString,
      value,
    };
  },
});
