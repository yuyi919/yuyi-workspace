import { LangiumDocument } from "langium";
import { CodeActionProvider as ICodeActionProvider } from "langium/lib/lsp/code-action";
import {
  CodeAction,
  CodeActionKind,
  CodeActionParams,
  Command,
  Diagnostic,
  Range
} from "vscode-languageserver-protocol";
import { AdvscriptServices } from "../advscript-module";
import { IssueCodes } from "../advscript-validator";


export class CodeActionProvider implements ICodeActionProvider {
  constructor(private services: AdvscriptServices) { }
  async getCodeActions(document: LangiumDocument, params: CodeActionParams) {
    const result: (Command | CodeAction)[] = [];
    for (const diagnostic of params.context.diagnostics) {
      const codeAction = await this.createCodeAction(diagnostic, document);
      if (codeAction) {
        result.push(codeAction);
      }
    }
    return result;
  }
  private createCodeAction(diagnostic: Diagnostic, document: LangiumDocument) {
    switch (diagnostic.code) {
      case IssueCodes.identifierNameLowercase:
        return this.makeLowerCase(diagnostic, document);
      case IssueCodes.identifierNameUppercase:
        return this.makeUpperCase(diagnostic, document);
      default:
        return undefined;
    }
  }

  _makeUpperOrLowerCase(range: Range, document: LangiumDocument, type: "Upper" | "Lower") {
    const name = document.textDocument.getText(range);
    return this.services.lsp.RenameHandler.renameElement(document, {
      textDocument: document.textDocument,
      position: range.start,
      newName: name[0][`to${type}Case`]() + name.slice(1, name.length),
    });
  }

  private async makeLowerCase(diagnostic: Diagnostic, document: LangiumDocument) {
    return {
      title: "First letter to lower case",
      kind: CodeActionKind.QuickFix,
      diagnostics: [diagnostic],
      isPreferred: true,
      edit: await this._makeUpperOrLowerCase(diagnostic.range, document, "Lower"),
    } as CodeAction;
  }

  private async makeUpperCase(diagnostic: Diagnostic, document: LangiumDocument) {
    return {
      title: "First letter to upper case",
      kind: CodeActionKind.QuickFix,
      diagnostics: [diagnostic],
      isPreferred: true,
      edit: await this._makeUpperOrLowerCase(diagnostic.range, document, "Upper"),
    } as CodeAction;
  }
}
