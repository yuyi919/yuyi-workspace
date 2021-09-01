import ts from "typescript";

export function isLiteralExpr(
  node: ts.Node
): node is
  | ts.LiteralExpression
  | ts.Token<ts.SyntaxKind.TrueKeyword>
  | ts.Token<ts.SyntaxKind.FalseKeyword>
  | ts.Token<ts.SyntaxKind.NullKeyword> {
  return (
    node &&
    (isNullExpr(node) || isBoolExpr(node) || isUndefinedExpr(node) || ts.isLiteralExpression(node))
  );
}
export function isObjectOrArrayLiteralExpr(
  node: ts.Node
): node is ts.ObjectLiteralExpression | ts.ArrayLiteralExpression {
  return node && (ts.isObjectLiteralExpression(node) || ts.isArrayLiteralExpression(node));
}
export function isLiteralOrIdentifierExpr(node: ts.Node) {
  return isLiteralExpr(node) || (node && node.kind === ts.SyntaxKind.Identifier);
}

export function isBoolExpr(node: ts.Node) {
  let text: string;
  return (
    node &&
    (node.kind === ts.SyntaxKind.FalseKeyword ||
      node.kind === ts.SyntaxKind.TrueKeyword ||
      (node.kind === ts.SyntaxKind.Identifier &&
        (text = ts.idText(node as ts.Identifier)) &&
        (text === "false" || text === "true")))
  );
}
export function isNullExpr(node: ts.Node) {
  return (
    node &&
    (node.kind === ts.SyntaxKind.NullKeyword ||
      (node.kind === ts.SyntaxKind.Identifier && ts.idText(node as ts.Identifier) === "null"))
  );
}
export function isUndefinedExpr(node: ts.Node) {
  return (
    node &&
    node.kind === ts.SyntaxKind.Identifier &&
    ts.idText(node as ts.Identifier) === "undefined"
  );
}
export function isNaN(node: ts.Node) {
  return (
    node && node.kind === ts.SyntaxKind.Identifier && ts.idText(node as ts.Identifier) === "NaN"
  );
}
export function createUndefinedExpr() {
  return ts.factory.createIdentifier("undefined");
}

export function isBlockOrSourceFile(node: ts.Node): node is ts.Block | ts.SourceFile {
  return node && (node.kind === ts.SyntaxKind.SourceFile || node.kind === ts.SyntaxKind.Block);
}

export function updateBlockOrSourceFile(
  node: ts.Block | ts.SourceFile,
  newStatments: ts.Statement[] | ts.NodeArray<ts.Statement>
) {
  return ts.isBlock(node)
    ? ts.factory.updateBlock(node, newStatments)
    : (ts.factory.updateSourceFile(node, newStatments) as unknown);
}
