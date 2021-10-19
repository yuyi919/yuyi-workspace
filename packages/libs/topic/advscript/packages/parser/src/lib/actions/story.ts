import { CommandExpressionData, defineActions, NodeTypeKind, StoryLineData } from "../interface";
import { toSourceString } from "./_util";

export const Story = defineActions<any>({
  StoryLine(story): StoryLineData {
    return {
      ...story.parse(),
      source: story.sourceString.replace(/\n$/, ""),
    };
  },
  // StoryLine_command(command): StoryLineData {
  //   const commandData = command.parse() as CommandExpressionData;
  //   console.log(commandData);
  //   const { name, params, flags, ...other } = commandData;
  //   return {
  //     ...other,
  //     command: name,
  //     arguments: [flags.reduce((r, flag) => ({ ...r, [flag]: true }), { ...params })],
  //     argumentExpression: commandData,
  //     type: "content",
  //     source: command.sourceString,
  //   };
  // },
  StoryLine_plainText(text, pipe): StoryLineData {
    const textContent = text.parse();
    console.log("StoryLine_plainText");
    return {
      command: "text",
      source: textContent,
      arguments: [textContent],
      pipe: pipe.parse(),
      // argumentExpression: { raw: { type: "value", value: textContent } },
      type: "content",
    };
  },
  template_quick(leftPad, text, split, pipe, rightPad) {
    return {
      type: "value",
      source: [leftPad, text, split, pipe, rightPad].map((o) => o.sourceString).join(""),
      value: text.parse(),
      pipe: pipe.parse(),
    };
  },
  template_native(leftPad, expr, rightPad) {
    return expr.parse();
  },
  story_line(start, expr, pipe, end): StoryLineData {
    console.log("story_line", expr.parse(), pipe.parse());
    return {
      command: "text",
      source: expr.sourceString,
      arguments: [
        {
          raw: {
            type: NodeTypeKind.Array,
            value: expr.parse(),
          },
        },
      ],
      pipe: pipe.parse(),
      type: "content",
    };
  },
  // story_line_pi(expr, expr2) {
  //   console.log("story_line", [expr.parse(), expr2.parse()])
  //   return expr.parse()
  // },
  StoryLine_templateText(line) {
    return line.parse();
  },
  fountain_character(arg0, flag, arg2, name, macro): StoryLineData {
    return {
      command: "character",
      source: toSourceString(arg0, flag, arg2, name, macro),
      arguments: [
        {
          name: name.parse(),
          status: macro.parse(),
        },
      ],
      type: "content",
    }
  },
  fountain_macro(arg0, text, arg2, pipe) {
    return  {
      text: text.parse(),
      use: pipe.parse(),
      type: "status",
    };
  },
  // Fountain_character(text): StoryLineData {
  //   return text.parse();
  // },
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
      source: command.sourceString,
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
  CallCommand(a, b, d) {
    return b.parse();
  },
  pipe_expr(a, b) {
    return b.parse();
  },
  // ...Command
});


