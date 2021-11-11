import { Adapter, tagToString, displayPartsToString } from "./_util";
import { editor, languages, Position, Range, CancellationToken, Uri } from "monaco-editor";
import type { WithMetadata, CompletionInfo } from "typescript";
import { Kind } from "./Kind";

export interface MyCompletionItem extends languages.CompletionItem {
  label: string;
  uri: Uri;
  position: Position;
  offset: number;
}

export class SuggestAdapter extends Adapter implements monaco.languages.CompletionItemProvider {
  public get triggerCharacters(): string[] {
    return ["."];
  }

  public async provideCompletionItems(
    model: editor.ITextModel,
    position: Position,
    _context: languages.CompletionContext,
    token: CancellationToken
  ): Promise<languages.CompletionList | undefined> {
    const wordInfo = model.getWordUntilPosition(position);
    const wordRange = new Range(
      position.lineNumber,
      wordInfo.startColumn,
      position.lineNumber,
      wordInfo.endColumn
    );
    const resource = model.uri;
    const offset = model.getOffsetAt(position);

    const worker = await this._worker(resource);

    if (model.isDisposed()) {
      return;
    }

    const info: WithMetadata<CompletionInfo> = await worker.getCompletionsAtPosition(
      resource.toString(),
      offset
    );

    console.log(info);
    if (!info || model.isDisposed()) {
      return;
    }

    const suggestions: MyCompletionItem[] = info.entries.map((entry) => {
      let range = wordRange;
      if (entry.replacementSpan) {
        const p1 = model.getPositionAt(entry.replacementSpan.start);
        const p2 = model.getPositionAt(entry.replacementSpan.start + entry.replacementSpan.length);
        range = new Range(p1.lineNumber, p1.column, p2.lineNumber, p2.column);
      }

      const tags: languages.CompletionItemTag[] = [];
      if (entry.kindModifiers?.indexOf("deprecated") !== -1) {
        tags.push(languages.CompletionItemTag.Deprecated);
      }

      return {
        uri: resource,
        position: position,
        offset: offset,
        range: range,
        label: entry.name,
        insertText: entry.name,
        sortText: entry.sortText,
        kind: SuggestAdapter.convertKind(entry.kind),
        tags,
      };
    });

    return {
      suggestions,
    };
  }

  public async resolveCompletionItem(
    item: languages.CompletionItem,
    token: CancellationToken
  ): Promise<languages.CompletionItem> {
    const myItem = <MyCompletionItem>item;
    const resource = myItem.uri;
    const position = myItem.position;
    const offset = myItem.offset;

    const worker = await this._worker(resource);
    const details = await worker.getCompletionEntryDetails(
      resource.toString(),
      offset,
      myItem.label
    );
    if (!details) {
      return myItem;
    }
    return <MyCompletionItem>{
      uri: resource,
      position: position,
      label: details.name,
      kind: SuggestAdapter.convertKind(details.kind),
      detail: displayPartsToString(details.displayParts),
      documentation: {
        value: SuggestAdapter.createDocumentationString(details),
      },
    };
  }

  private static convertKind(kind: string): languages.CompletionItemKind {
    switch (kind) {
      case Kind.primitiveType:
      case Kind.keyword:
        return languages.CompletionItemKind.Keyword;
      case Kind.variable:
      case Kind.localVariable:
      case Kind.const:
        return languages.CompletionItemKind.Variable;
      case Kind.memberVariable:
      case Kind.memberGetAccessor:
      case Kind.memberSetAccessor:
        return languages.CompletionItemKind.Field;
      case Kind.function:
      case Kind.memberFunction:
      case Kind.constructSignature:
      case Kind.callSignature:
      case Kind.indexSignature:
        return languages.CompletionItemKind.Function;
      case Kind.enum:
        return languages.CompletionItemKind.Enum;
      case Kind.module:
        return languages.CompletionItemKind.Module;
      case Kind.class:
        return languages.CompletionItemKind.Class;
      case Kind.interface:
        return languages.CompletionItemKind.Interface;
      case Kind.warning:
        return languages.CompletionItemKind.File;
    }

    return languages.CompletionItemKind.Property;
  }

  private static createDocumentationString(details: ts.CompletionEntryDetails): string {
    let documentationString = displayPartsToString(details.documentation);
    if (details.tags) {
      for (const tag of details.tags) {
        documentationString += `\n\n${tagToString(tag)}`;
      }
    }
    return documentationString;
  }
}
