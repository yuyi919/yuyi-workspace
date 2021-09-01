import ts from "typescript";

export const InternalPrinter = ts.createPrinter({
  newLine: ts.NewLineKind.CarriageReturnLineFeed,
  omitTrailingSemicolon: true,
});
const resultFile = ts.createSourceFile("", "", ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
export function printNodes(nodes: ts.Node[] | ts.NodeArray<ts.Node>) {
  let printed = "";
  for (const node of nodes)
    printed += "\n" + InternalPrinter.printNode(ts.EmitHint.Unspecified, node, resultFile);

  return printed;
}

export function printNode(node: ts.Node) {
  return InternalPrinter.printNode(ts.EmitHint.Unspecified, node, resultFile);
}
