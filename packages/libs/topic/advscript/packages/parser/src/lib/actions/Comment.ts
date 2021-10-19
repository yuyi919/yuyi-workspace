import { defineActions, NodeTypeKind, SingleCommentNodeData } from "../interface";

export const Comment = defineActions({
  Comment_single(head, text): SingleCommentNodeData {
    return {
      type: NodeTypeKind.Comment,
      value: text.parse(),
    };
  },
  Comment_notes(text) {
    return text.parse()
  },
  comment_inline(start, text, end): SingleCommentNodeData {
    return {
      type: NodeTypeKind.Comment,
      value: text.parse(),
    };
  },
  Comment_multi(head, text, foot) {
    // console.log(text.parse());
    return {
      type: NodeTypeKind.Comment,
      value: text.parse(),
    };
  },
});
