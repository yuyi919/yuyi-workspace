import grammar, { AVSGrammar } from "../../../ohm/expression.ohm-bundle";
import { Node } from "ohm-js";
import { Base } from "../actions/base";
import { CommandExpressionData, PipeExpressionData } from "../interface";
import { Exp } from "./Exp";
import { Expression } from "./Expression";
import { Keyvalue } from "./keyvalue";

export * from "./Exp";
export * from "./Expression";
export { semantics as ExpressionSemantics };

const semantics = (grammar as AVSGrammar).createSemantics();

semantics.addOperation("parse", {
  ...Exp,
  ...Expression,
  ...Keyvalue,
  ...Base,
  Process_Command(_, command: Node<CommandExpressionData>, pipe, $) {
    return {
      ...command.parse(),
      pipe: pipe.parse() || [],
      text: command.sourceString,
    };
  },
  Process_Inline(_, expr, pipe, $) {
    return {
      ...expr.parse(),
      pipe: pipe.parse(),
    };
  },
  Process_Pipe(_, expr) {
    return expr.parse();
  },
  PipeMacro(_, command: Node<CommandExpressionData>): PipeExpressionData {
    return {
      ...command.parse(),
      type: "pipe",
    };
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

export function parseExpression(source: string) {
  const result2 = grammar.match(source);
  if (result2.succeeded()) {
    const list = semantics(result2).parse();
    const data = list instanceof Array ? list.flat(1) : [list];
    console.log("=>", ...data);
    return data;
  } else {
    throw Error(result2.message);
  }
  // const result = Grammar.match(source);
  // if (result.succeeded()) {
  //   return mySemantics(result).parse();
  // } else {
  //   throw Error(result.message);
  // }
}
