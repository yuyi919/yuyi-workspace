import { AstNode, LangiumDocument, MaybePromise, streamContents } from "langium";
import { DefaultDocumentSymbolProvider } from "langium/lib/lsp/document-symbol-provider";
import * as Lsp from "vscode-languageserver-protocol";
import { SymbolKind } from "vscode-languageserver-protocol";
import * as ast from "../ast";
import * as Refenences from "../references";

export class DocumentSymbolProvider extends DefaultDocumentSymbolProvider {
  declare nameProvider: Refenences.NameProvider;
  getSymbols(document: LangiumDocument): MaybePromise<Lsp.DocumentSymbol[]> {
    const symbols = this.getSymbol(document, document.parseResult.value);
    console.log(symbols);
    return symbols;
  }
  protected getSymbol(document: LangiumDocument, astNode: AstNode): Lsp.DocumentSymbol[] {
    const node = astNode.$cstNode;
    const nameNode = this.nameProvider.getNameNode(astNode);
    console.log(node.element, nameNode);
    if (nameNode && node) {
      const name = this.nameProvider.getDisplayName(astNode);
      return [
        {
          kind: this.getSymbolKind(astNode.$type),
          name: name ?? nameNode.text,
          range: node.range,
          selectionRange: nameNode.range,
          children: this.getChildSymbols(document, astNode),
          detail: "(detail)",
        },
      ];
    }
    return this.getChildSymbols(document, astNode) || [];
  }
  protected getChildSymbols(
    document: LangiumDocument,
    astNode: AstNode
  ): Lsp.DocumentSymbol[] | undefined {
    const children: Lsp.DocumentSymbol[] = [];
    if (!ast.isDialog(astNode)) {
      for (const child of streamContents(astNode)) {
        if (!ast.isIdentifierNode(child.node)) {
          const result = this.getSymbol(document, child.node);
          children.push(...result);
        }
      }
    }
    return children.length > 0 ? children : undefined;
  }
  protected getSymbolKind(type: string): Lsp.SymbolKind {
    if (type === ast.KeyedDeclareKind) {
      return SymbolKind.EnumMember;
    }
    if (ast.reflection.isSubtype(type, ast.DeclareKind)) {
      return SymbolKind.Package;
    }
    switch (type) {
      case ast.Modifier:
        return SymbolKind.Property;
      case ast.Param:
        return SymbolKind.Field;
      case ast.Character:
        return SymbolKind.Class;
      case ast.Macro:
        return SymbolKind.Function;
      case ast.Variable:
        return SymbolKind.Variable;
      case ast.Dialog:
      case ast.Action:
        return SymbolKind.Event;
    }
    return SymbolKind.Constant;
  }
}
