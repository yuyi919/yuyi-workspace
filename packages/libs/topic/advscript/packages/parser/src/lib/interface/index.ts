import { AdvScriptActionDict, AdvFountainActionDict } from "@adv.ohm-bundle";

export function defineActions<T>(actions: AdvFountainActionDict<T>): AdvFountainActionDict<T> {
  return actions;
}

export function defineExpressionActions<T>(
  actions: AdvScriptActionDict<T>
): AdvScriptActionDict<T> {
  return actions;
}

export * from "./base";
export * from "./Comment";
export * from "./Expression";
export * from "./LogicBlock";
export * from "./story";

import { LogicStatment } from "./LogicBlock";
import { ContentLine, StatmentArray } from "./story";
import { CommentBlock } from "./Comment";

export type DocumentLine = ContentLine | CommentBlock | LogicStatment | StatmentArray;
