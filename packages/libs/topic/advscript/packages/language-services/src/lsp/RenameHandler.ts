import { LangiumDocument } from "langium";
import { DefaultRenameHandler } from "langium/lib/lsp/rename-refactoring";
import * as Lsp from "vscode-languageserver-protocol";
import { TextEdit } from "vscode-languageserver-protocol";
import { ReferenceFinder } from "./ReferenceFinder";


export class RenameHandler extends DefaultRenameHandler {
  declare referenceFinder: ReferenceFinder;

  async renameElement(
    document: LangiumDocument,
    params: Lsp.RenameParams
  ): Promise<Lsp.WorkspaceEdit | undefined> {
    const changes: Record<string, TextEdit[]> = {};
    const references = await this.referenceFinder.findNameReferences(document, {
      ...params,
      context: { includeDeclaration: true },
    });
    if (!Array.isArray(references)) {
      return undefined;
    }
    references.forEach((location) => {
      const change = TextEdit.replace(location.range, params.newName);
      if (changes[location.uri]) {
        changes[location.uri].push(change);
      } else {
        changes[location.uri] = [change];
      }
    });
    return { changes };
  }
}
