import { tryParseExpression } from "./lib/expression";
import { Zh_CN } from "./lib/expression/SyntaxError";
import { DocumentLine, isStatmentArray, LogickStatmentKind, NodeTypeKind } from "./lib/interface";
import { getParserContext } from "./lib/parser";
import { createScope } from "./lib/scope";
import file from "./line.avs";

globalThis.parseExpression = (source: string) => tryParseExpression(source, Zh_CN);
globalThis.createScope = createScope;
function run() {
  const languageId = "advscript";
  // const services = new EmbeddedTypescriptWorker();
  // services.init().then(() => services.registerCompletionItemProvider("advscript"));
  // services.addExtraLib(() => import("@addLibs/testLib/*").then((data) => data.default));
}
run();
