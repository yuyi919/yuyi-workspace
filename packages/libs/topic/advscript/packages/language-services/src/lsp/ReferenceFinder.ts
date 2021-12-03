import {
  AstNode, getDocument, isReference,
  LangiumDocument, MaybePromise, findLeafNodeAtOffset
} from "langium";
import { DefaultReferenceFinder } from "langium/lib/lsp/reference-finder";
import * as Lsp from "vscode-languageserver-protocol";
import { Location } from "vscode-languageserver-protocol";
import { URI } from "vscode-uri";
import * as ast from "../ast";


export class ReferenceFinder extends DefaultReferenceFinder {
  findReferences(
    document: LangiumDocument,
    params: Lsp.ReferenceParams
  ): MaybePromise<Lsp.Location[]> {
    const rootNode = document.parseResult.value.$cstNode;
    if (!rootNode) {
      return [];
    }
    const refs: Array<{ docUri: URI; range: Lsp.Range; }> = [];
    const selectedNode = findLeafNodeAtOffset(
      rootNode,
      document.textDocument.offsetAt(params.position)
    );
    if (!selectedNode) {
      return [];
    }
    const targetAstNode = this.references.findDeclaration(selectedNode)?.element;
    if (targetAstNode) {
      if (params.context.includeDeclaration) {
        const declDoc = getDocument(targetAstNode);
        const nameNode = this.findNameNode(targetAstNode, selectedNode.text);
        if (nameNode)
          refs.push({ docUri: declDoc.uri, range: nameNode.range });
      }
      this.references.findReferences(targetAstNode).forEach((reference) => {
        if (isReference(reference)) {
          refs.push({ docUri: document.uri, range: reference.$refNode.range });
        } else {
          const range = reference.segment.range;
          const el = findLeafNodeAtOffset(
            document.parseResult.value.$cstNode,
            document.textDocument.offsetAt(reference.segment.range.start)
          )?.element;
          refs.push({
            docUri: reference.sourceUri,
            range: this.findReferenceWithAstNode(el) || range,
          });
        }
      });
    }
    return refs.map((ref) => Location.create(ref.docUri.toString(), ref.range));
  }

  findNameReferences(
    document: LangiumDocument,
    params: Lsp.ReferenceParams
  ): MaybePromise<Lsp.Location[]> {
    return super.findReferences(document, params);
  }

  private findReferenceWithAstNode(el: AstNode): Lsp.Range {
    if (ast.isDialogModifier(el)) {
      return el.$container.$cstNode.range;
    }
    return el?.$cstNode?.range;
  }
}
