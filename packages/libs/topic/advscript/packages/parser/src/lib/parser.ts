import { Actions } from "./actions";
import { ExpressionActions } from "./expression/actions";
import { AdvFountain as grammar } from "./grammars";
import { DocumentLine } from "./interface";
import { ParserContext } from "./ParserContext";

export const Semantics = grammar.createSemantics();
// console.log(Semantics);

Semantics.addOperation("parse", {
  ...ExpressionActions,
  ...Actions,
});
function getMatcher(source: string) {
  const matcher = grammar.matcher().replaceInputRange(0, 0, source);
  console.log(matcher, source);
  return matcher.match("Main");
}
Semantics.addAttribute("parseExpression", {
  _nonterminal(...node) {
    return getMatcher(this.sourceString);
  },
  _terminal() {
    return getMatcher(this.sourceString);
  },
  _iter(...nodes) {
    return getMatcher(this.sourceString);
  },
});

const ParserMap = new Map<string, ParserContext>();
export function getParserContext(id: string) {
  // console.log("getParserContext", id);
  return ParserMap.get(id);
}
export function createParser(id?: string) {
  if (ParserMap.has(id)) return ParserMap.get(id).flush();
  console.log("createParser", id);
  const parser = new ParserContext(grammar);
  ParserMap.set(id, parser);
  return parser;
}

export function parseExpression(source: string): DocumentLine[] {
  const result = grammar.match(source, "Main");
  if (result.succeeded()) {
    console.log("result2");
    return Semantics(result).parse();
  } else {
    throw Error(result.message);
  }
}
