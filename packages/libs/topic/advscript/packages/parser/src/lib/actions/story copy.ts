//@ts-nocheck
import type { Node } from "ohm-js";
import {
  defineActions,
  StoryLineData,
  CommandExpressionData,
  CallExpressionData,
} from "../interface";

export const Story = defineActions<any>({
  // StoryLine_formatA(head, command, content, foot): IContent {
  //   console.warn("[Deprecated] Command beginning with `@` will no longer be supported.");
  //   const res = content.parse();
  //   return {
  //     type: "content",
  //     command: command.parse(),
  //     params: res.params,
  //     flags: res.flags,
  //     text: commandToString([head, command, content, foot]),
  //   };
  // },
  StoryLine_command(command): StoryLineData {
    const commandData = command.parse() as CommandExpressionData;
    const { name, params, flags, ...other } = commandData;
    return {
      ...other,
      command: name,
      arguments: [flags.reduce((r, flag) => ({ ...r, [flag]: true }), { ...params })],
      argumentExpression: commandData,
      type: "content",
      source: command.sourceString,
    };
  },
  // StoryLine_formatC(head, command, foot): IContent {
  //   console.warn("[Deprecated] Command beginning with `@` will no longer be supported.");
  //   return {
  //     type: "content",
  //     command: command.parse(),
  //     flags: [],
  //     params: {},
  //     text: commandToString([head, command, foot]),
  //   };
  // },
  // StoryLine_formatD(head, command, foot): IContent {
  //   return {
  //     type: "content",
  //     command: command.parse(),
  //     flags: [],
  //     params: {},
  //     text: command.sourceString,
  //   };
  // },
  StoryLine_plainText(text): StoryLineData {
    const textContent = text.parse();
    return {
      command: "text",
      source: textContent,
      arguments: [textContent],
      // argumentExpression: { raw: { type: "value", value: textContent } },
      type: "content",
    };
  },
  StoryLine_templateText(
    flag,
    before,
    leftPad,
    identifier,
    pipeFlag,
    pipeName,
    rightPad,
    after
  ): StoryLineData {
    return {
      command: "text",
      source: [before, leftPad, identifier, rightPad, after].map((o) => o.sourceString).join(""),
      // params: {
      //   raw: {
      //     type: "array",
      //     value: [before, identifier, pipeName, after]
      //       .map((o) => o.parse())
      //       .flat(1)
      //       .filter(Boolean),
      //   },
      // },
      arguments: [
        {
          type: NodeTypeKind.Array,
          value: [before, identifier, pipeName, after]
            .map((o) => o.parse())
            .flat(1)
            .filter(Boolean),
        },
      ],
      type: "content",
    };
  },
  Fountain_character(flag, text, status) {
    return {
      command: "character",
      text: toSourceString(flag, text, status),
      params: {
        name: text.parse(),
        status: status.parse(),
      },
      flags: [],
      type: "content",
    };
  },
  Fountain_characterStatus(macro) {
    const { value: text, pipe } = macro.parse() || {};
    return {
      text,
      use: pipe,
      type: "status",
    };
  },
  Fountain_macro(leftPad, expression, rightPad, command) {
    return {
      value: expression.parse(),
      pipe: command.parse()?.[0],
      type: "macro",
    };
  },
  Fountain_callMacro(command) {
    return {
      ...command.parse(),
      text: command.sourceString,
      type: "callMacro",
    };
  },
  Fountain_characterEscape(macro) {
    const { value: text, pipe } = macro.parse() || {};
    return {
      text,
      use: pipe,
      type: "escape",
    };
  },
  CallExpression(callName, head, args, foot): CallExpressionData {
    return {
      type: "CallExpression",
      arguments: args.parse(),
      name: callName.parse(),
    };
  },
  CallCommand(head, command: Node<CommandExpressionData>, pipe, foot) {
    return {
      ...command.parse(),
      pipe: pipe.parse() || [],
      text: commandToString([head, command, foot]),
    };
  },
  PipeExpression(flag, command: Node<CommandExpressionData>) {
    const node = {
      ...command.parse(),
      type: "pipe",
    } as const;
    return node;
  },
  Command(command, params): CommandExpressionData {
    const res = params.parse()?.[0] || {};
    return {
      type: "command",
      name: command.parse(),
      params: res.params || {},
      flags: res.flags || [],
      pipe: [],
    };
  },
});
function commandToString(textspec: Node[]): string {
  return textspec.map((o, i) => o.sourceString + (i > 0 ? " " : "")).join("");
}

function toSourceString(...textspec: Node[]): string {
  return textspec.map((o) => o.sourceString).join("");
}
