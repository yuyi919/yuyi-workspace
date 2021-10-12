// export const Comment = ({
//   Comment_single(head, text) {
//     return {
//       type: "comment",
//       value: text.parse(),
//     };
//   },
//   Comment_multi(head, text, foot) {
//     return {
//       type: "comment",
//       value: text.parse(),
//     };
//   },
// });

export type CommentNodeData = SingleCommentNodeData | MultiCommentNodeData
export interface SingleCommentNodeData {
  type: "comment",
  value: string
}

export interface MultiCommentNodeData {
  type: "comment",
  value: string[]
}
