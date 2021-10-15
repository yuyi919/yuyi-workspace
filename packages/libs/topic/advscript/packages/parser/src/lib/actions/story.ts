import type { Node } from "ohm-js";
import { defineActions } from "../interface";
export interface IContent {
  type: "content";
  command: "text" | (string & {});
  flags: string[];
  params: Record<string, any>;
  text: string;
}
export const Story = defineActions({
  StoryLine_formatA(head, command, content, foot): IContent {
    console.warn("[Deprecated] Command beginning with `@` will no longer be supported.");
    const res = content.parse();
    return {
      type: "content",
      command: command.parse(),
      params: res.params,
      flags: res.flags,
      text: commandToString([head, command, content, foot]),
    };
  },
  StoryLine_formatB(head, command, content, foot): IContent {
    const res = content.parse();
    return {
      type: "content",
      command: command.parse(),
      params: res.params,
      flags: res.flags,
      text: commandToString([head, command, content, foot]),
    };
  },
  StoryLine_formatC(head, command, foot): IContent {
    console.warn("[Deprecated] Command beginning with `@` will no longer be supported.");
    return {
      type: "content",
      command: command.parse(),
      flags: [],
      params: {},
      text: commandToString([head, command, foot]),
    };
  },
  StoryLine_formatD(head, command, foot): IContent {
    return {
      type: "content",
      command: command.parse(),
      flags: [],
      params: {},
      text: command.sourceString,
    };
  },
  StoryLine_formatE(text): IContent {
    const textContent = text.parse();
    return {
      command: "text",
      text: textContent,
      params: { raw: { type: "value", value: textContent } },
      flags: [],
      type: "content",
    };
  },
  StoryLine_formatVar(before, leftPad, identifier, rightPad, after): IContent {
    return {
      command: "text",
      text: [before, leftPad, identifier, rightPad, after].map((o) => o.sourceString).join(""),
      params: {
        raw: {
          type: "array",
          value: [before, identifier, after]
            .map((o) => o.parse())
            .flat(1)
            .filter(Boolean),
        },
      },
      flags: [],
      type: "content",
    };
  },
  command(key): IContent {
    return key.parse();
  },
});
function commandToString(textspec: Node[]): string {
  return textspec.map((o, i) => o.sourceString + (i > 0 ? " " : "")).join("");
}
