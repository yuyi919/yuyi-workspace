import { NodeTypeKind } from ".";
import { BaseNodeData } from "./base";

export type CommandExpressionData = BaseNodeData & {
  type: "command";
  name: string;
  flags: string[];
  params: Record<string, any>;
  pipe: PipeExpressionData[];
};
export type CallExpressionData = BaseNodeData & {
  type: NodeTypeKind.CallExpression;
  name: string;
  arguments: any[];
  argumentExpression?: CommandExpressionData;
};

export type PipeExpressionData = Omit<CommandExpressionData, "type"> & {
  type: "pipe";
};
export type StoryLineData = Omit<CallExpressionData, "type" | "name"> & {
  type: "content";
  command: "text" | (string & {});
  source?: string;
  pipe?: PipeExpressionData[];
};
