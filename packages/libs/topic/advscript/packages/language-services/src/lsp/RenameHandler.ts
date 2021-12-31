import { LangiumDocument } from "langium";
import { DefaultRenameHandler } from "langium/lib/lsp/rename-refactoring";
import type * as Lsp from "vscode-languageserver-protocol";
import { TextEdit, Range } from "vscode-languageserver-protocol";
import { ReferenceFinder } from "./ReferenceFinder";

export class RenameHandler extends DefaultRenameHandler {
  declare referenceFinder: ReferenceFinder;

  async linkedEditingLocation(
    document: LangiumDocument,
    params: Lsp.LinkedEditingRangeParams
  ): Promise<Lsp.Location[] | undefined> {
    const references = await this.referenceFinder.findNameReferences2(document, {
      ...params,
      context: { includeDeclaration: true },
    });
    if (!Array.isArray(references) || !references.length) {
      return undefined;
    }
    return references;
  }

  async renameElement(
    document: LangiumDocument,
    params: Lsp.RenameParams
  ): Promise<Lsp.WorkspaceEdit | undefined> {
    const changes: Record<string, TextEdit[]> = {};
    const references = await this.linkedEditingLocation(document, params);
    if (references) {
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
}
