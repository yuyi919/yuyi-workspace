import ts from "typescript";

export type TagCollection<Name = string> = {
  name: Name;
  value: string;
  paramName?: string;
  paramType?: any;
};

export function markSyntaxListWithTypeNode(node: ts.TypeNode) {
  return node.parent?.parent
    ?.getChildren()
    .find((node) => node.kind === ts.SyntaxKind.SyntaxList)
    ?.getChildren();
}
/**
 * 解析Comment
 * @param member
 * @param sourceFile
 */
export function markBarTokenWithTypeNode(
  member: ts.TypeNode,
  syntaxList: (ts.Node | ts.Token<ts.SyntaxKind.BarToken>)[] = markSyntaxListWithTypeNode(member)
) {
  let barTokenNode: ts.Token<ts.SyntaxKind.BarToken>;
  for (let i = 0; i < syntaxList.length; i++) {
    if (syntaxList[i] === member.parent) {
      const hasBarToken = syntaxList[i - 1];
      if (hasBarToken.kind === ts.SyntaxKind.BarToken) {
        barTokenNode = hasBarToken as ts.Token<ts.SyntaxKind.BarToken>;
      }
    }
  }
  return barTokenNode;
}
/**
 * 解析Comment
 * @param member
 * @param sourceFile
 */
export function extractComment(
  member: ts.Node,
  sourceFile: ts.SourceFile = member.getSourceFile()
) {
  const sourceFileText = sourceFile.getFullText();
  const comments = ts
    .reduceEachLeadingCommentRange(
      sourceFileText,
      member.pos,
      (pos, end, kind, hasTrailingNewLine: boolean, state, memo) => {
        const commentList: string[] = sourceFileText
          .slice(pos, end)
          .replace(/\r/g, "")
          .split(/\n/g)
          .map((str) => str.replace(/\/\*\*| *?\* |\*\//g, ""))
          .filter((str) => str && str.trim());
        const tagStart = commentList.findIndex((str) => str && str.startsWith("@"));
        return [
          ...memo,
          (tagStart > -1 ? commentList.slice(0, tagStart) : commentList).join("\r\n"),
        ];
      },
      {},
      []
    )
    .filter(Boolean)
    .join("\r\n");
  const tags: TagCollection[] = ts
    // @ts-ignore
    .getAllJSDocTags(member, (node) => {
      member.kind === ts.SyntaxKind.BarToken && console.log(ts.SyntaxKind[node.kind]);
      return true;
    })
    .map(
      (tag) =>
        ({
          name: tag.tagName.text,
          value: normlizeComment(tag.comment),
          paramName: ts.isJSDocParameterTag(tag) ? (tag.name as ts.Identifier)?.text : void 0,
          paramType: ts.isJSDocParameterTag(tag) ? tag.typeExpression?.getText() : void 0,
        } as TagCollection)
    );

  return { comments, tags };
}

export function normlizeComment(comment: string | ts.NodeArray<ts.JSDocComment>) {
  if (comment instanceof Array) {
    return comment
      .map((comment) => {
        return comment.text;
      })
      .join("\n");
  }
  return comment;
}
