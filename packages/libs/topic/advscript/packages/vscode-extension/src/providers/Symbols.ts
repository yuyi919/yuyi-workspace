import { parsedDocuments } from "../extension";
import { secondsToMinutesString } from "../utils";
import * as vscode from "vscode";
import * as afterparser from "../afterwriting-parser";

export class SymbolProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
    const symbols: vscode.DocumentSymbol[] = [];
    let scenecounter = 0;

    //hierarchyend is the last line of the token's hierarchy. Last line of document for the root, last line of current section, etc...
    function symbolFromStruct(
      token: afterparser.StructToken,
      nexttoken: afterparser.StructToken,
      hierarchyend: number
    ): { symbol: vscode.DocumentSymbol; length: number } {
      const returnvalue: { symbol: vscode.DocumentSymbol; length: number } = {
        symbol: undefined,
        length: 0,
      };
      const start = token.range.start;
      let end = document.lineAt(hierarchyend - 1).range.end;
      let details = undefined;
      if (hierarchyend == start.line) end = document.lineAt(hierarchyend).range.end;
      if (nexttoken != undefined) {
        end = nexttoken.range.start;
      }
      if (!token.section) {
        const sceneLength =
          parsedDocuments.get(document.uri.toString()).properties.scenes[scenecounter]
            .actionLength +
          parsedDocuments.get(document.uri.toString()).properties.scenes[scenecounter]
            .dialogueLength;
        details = secondsToMinutesString(sceneLength);
        returnvalue.length = sceneLength;
        scenecounter++;
      }
      let symbolname = " ";
      if (token.text != "") symbolname = token.text;
      const symbol = new vscode.DocumentSymbol(
        symbolname,
        details,
        vscode.SymbolKind.String,
        new vscode.Range(start, end),
        token.range
      );
      symbol.children = [];

      let childrenLength = 0;
      if (token.children != undefined) {
        for (let index = 0; index < token.children.length; index++) {
          const childsymbol = symbolFromStruct(
            token.children[index],
            token.children[index + 1],
            end.line
          );
          symbol.children.push(childsymbol.symbol);
          childrenLength += childsymbol.length;
        }
      }
      if (token.section) {
        returnvalue.length = childrenLength;
        symbol.detail = secondsToMinutesString(childrenLength);
      }
      returnvalue.symbol = symbol;
      return returnvalue;
    }

    for (
      let index = 0;
      index < parsedDocuments.get(document.uri.toString()).properties.structure.length;
      index++
    ) {
      symbols.push(
        symbolFromStruct(
          parsedDocuments.get(document.uri.toString()).properties.structure[index],
          parsedDocuments.get(document.uri.toString()).properties.structure[index + 1],
          document.lineCount
        ).symbol
      );
    }
    return symbols;
  }
}
