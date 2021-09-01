import ts from "typescript";
export function getKeyNameStrFromNode(node: ts.Node): string {
  const name = getKeyNameFromNode(node);
  return ts.isCallExpression(node)
    ? getKeyNameStrFromNode(node.expression)
    : (ts.isPropertyAccessExpression(node) ? getKeyNameStrFromNode(node.expression) + "." : "") +
        (name.escapedText as string);
}
export function getLeafKeyNameStrFromNode(node: ts.Node): string {
  const name = getKeyNameFromNode(node);
  return ts.isCallExpression(node)
    ? getLeafKeyNameStrFromNode(node.expression)
    : (name.escapedText as string);
}
export function getKeyNameFromNode(node: ts.Node) {
  return ts.isIdentifier(node) ? node : ts.isPropertyAccessExpression(node) ? node.name : void 0;
}
