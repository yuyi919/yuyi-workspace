// import grammar from "../../../ohm/expression.ohm-bundle";
import { AdvFountain as grammar } from "../grammars";
import { ExpressionNodeData } from "../interface";
import { printError } from "../util";
import { SyntaxError } from "./SyntaxError";

export * from "./Exp";
export * from "./Expression";
// export { semantics as ExpressionSemantics };
import { Semantics } from "../parser";

export function tryParseExpression(source: string, template?: Record<string, string>) {
  try {
    return parseExpression(source, template);
  } catch (error) {
    printError(error);
  }
}

export function parseExpression(source: string, template?: Record<string, string>) {
  // console.log(grammar.trace(source, "Exp").toString());
  try {
    const result = grammar.match(source, "Main");
    if (result.succeeded()) {
      // console.log(result2);
      const data = Semantics(result).parse() as ExpressionNodeData;
      // console.log(source, "=>", data);
      return data;
    }
    throw Error(result.message);
  } catch (error) {
    if (error instanceof Error && !error.message.startsWith("Missing semantic action")) {
      // console.log({ e: error });
      throw new SyntaxError(error, template);
    }
    throw error;
  }
}
