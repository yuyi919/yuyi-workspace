import { defineActions } from "../interface";

export const Comment = defineActions({
  Comment_single(head, text) {
    return {
      type: "comment",
      value: text.parse(),
    };
  },
  Comment_multi(head, text, foot) {
    return {
      type: "comment",
      value: text.parse(),
    };
  },
});
