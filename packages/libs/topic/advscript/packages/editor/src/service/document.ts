import type * as Lsp from "vscode-languageserver-protocol";
import type { TextDocument } from "vscode-languageserver-textdocument";
import { AdvScript, IIncrementRange, ContentKind } from "@yuyi919/advscript-parser";
import { debounce } from "lodash";

class OhmDcocument implements TextDocument {
  private runtime = new AdvScript();
  private _uri: Lsp.DocumentUri;
  private _languageId: string;
  private _version: number;
  private _content: string;
  private _lineOffsets: number[] | undefined;

  public constructor(uri: Lsp.DocumentUri, languageId: string, version: number, content: string) {
    this._uri = uri;
    this._languageId = languageId;
    this._version = version;
    this._content = content;
    this._lineOffsets = undefined;
    this.parsedDocument(uri, content);
  }

  private parsedDocument(id: string, file: string, range?: IIncrementRange[]) {
    try {
      console.groupCollapsed("[Story] parsedDocument");
      this.runtime.load(id, file, range);
      console.time("[Story] run");
      // const lines = [...story];
      for (const line of this.runtime) {
        // console.log(line)
        if (line.kind === ContentKind.Line) {
          console.debug("call %s", line.command, ...(line.argumentList || []));
        } else {
          console.debug(line);
        }
      }
      console.timeEnd("[Story] run");
      // console.log(lines);
    } catch (e) {
      console.error(e);
    } finally {
      console.groupEnd();
    }
  }

  public get uri(): string {
    return this._uri;
  }

  public get languageId(): string {
    return this._languageId;
  }

  public get version(): number {
    return this._version;
  }

  public getText(range?: Lsp.Range): string {
    if (range) {
      const start = this.offsetAt(range.start);
      const end = this.offsetAt(range.end);
      return this._content.substring(start, end);
    }
    return this._content;
  }

  public update(changes: Lsp.TextDocumentContentChangeEvent[], version: number): void {
    for (const change of changes) {
      if (OhmDcocument.isIncremental(change)) {
        // makes sure start is before end
        const range = getWellformedRange(change.range);

        // update content
        const startOffset = this.offsetAt(range.start);
        const endOffset = this.offsetAt(range.end);
        this._content =
          this._content.substring(0, startOffset) +
          change.text +
          this._content.substring(endOffset, this._content.length);

        // update the offsets
        const startLine = Math.max(range.start.line, 0);
        const endLine = Math.max(range.end.line, 0);
        let lineOffsets = this._lineOffsets!;
        const addedLineOffsets = computeLineOffsets(change.text, false, startOffset);
        if (endLine - startLine === addedLineOffsets.length) {
          for (let i = 0, len = addedLineOffsets.length; i < len; i++) {
            lineOffsets[i + startLine + 1] = addedLineOffsets[i];
          }
        } else {
          if (addedLineOffsets.length < 10000) {
            lineOffsets.splice(startLine + 1, endLine - startLine, ...addedLineOffsets);
          } else {
            // avoid too many arguments for splice
            this._lineOffsets = lineOffsets = lineOffsets
              .slice(0, startLine + 1)
              .concat(addedLineOffsets, lineOffsets.slice(endLine + 1));
          }
        }
        const diff = change.text.length - (endOffset - startOffset);
        if (diff !== 0) {
          for (
            let i = startLine + 1 + addedLineOffsets.length, len = lineOffsets.length;
            i < len;
            i++
          ) {
            lineOffsets[i] = lineOffsets[i] + diff;
          }
        }
        this.changes.push({
          startIdx: startOffset,
          endIdx: endOffset,
          content: change.text,
        });
      } else if (OhmDcocument.isFull(change)) {
        this._content = change.text;
        this._lineOffsets = undefined;
      } else {
        throw new Error("Unknown change event received");
      }
    }
    this._version = version;
  }
  fireChanges = debounce(function () {
    const changes = this.changes.splice(0, this.changes.length);
    console.log("fireChanges", changes);
    // this.parsedDocument(this._uri, this._content, changes);
  }, 200);
  changes: IIncrementRange[] = [];

  private getLineOffsets(): number[] {
    if (this._lineOffsets === undefined) {
      this._lineOffsets = computeLineOffsets(this._content, true);
    }
    return this._lineOffsets;
  }

  public positionAt(offset: number): Lsp.Position {
    offset = Math.max(Math.min(offset, this._content.length), 0);

    const lineOffsets = this.getLineOffsets();
    let low = 0,
      high = lineOffsets.length;
    if (high === 0) {
      return { line: 0, character: offset };
    }
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (lineOffsets[mid] > offset) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    // low is the least x for which the line offset is larger than the current offset
    // or array.length if no line offset is larger than the current offset
    const line = low - 1;
    return { line, character: offset - lineOffsets[line] };
  }

  public offsetAt(position: Lsp.Position) {
    const lineOffsets = this.getLineOffsets();
    if (position.line >= lineOffsets.length) {
      return this._content.length;
    } else if (position.line < 0) {
      return 0;
    }
    const lineOffset = lineOffsets[position.line];
    const nextLineOffset =
      position.line + 1 < lineOffsets.length
        ? lineOffsets[position.line + 1]
        : this._content.length;
    return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
  }

  public get lineCount() {
    return this.getLineOffsets().length;
  }

  private static isIncremental(
    event: Lsp.TextDocumentContentChangeEvent
  ): event is { range: Lsp.Range; rangeLength?: number; text: string } {
    const candidate: { range: Lsp.Range; rangeLength?: number; text: string } = event as any;
    return (
      candidate !== undefined &&
      candidate !== null &&
      typeof candidate.text === "string" &&
      candidate.range !== undefined &&
      (candidate.rangeLength === undefined || typeof candidate.rangeLength === "number")
    );
  }

  private static isFull(event: Lsp.TextDocumentContentChangeEvent): event is { text: string } {
    const candidate: { range?: Lsp.Range; rangeLength?: number; text: string } = event as any;
    return (
      candidate !== undefined &&
      candidate !== null &&
      typeof candidate.text === "string" &&
      candidate.range === undefined &&
      candidate.rangeLength === undefined
    );
  }
}
/**
 * Creates a new text document.
 *
 * @param uri The document's uri.
 * @param languageId  The document's language Id.
 * @param version The document's initial version number.
 * @param content The document's content.
 */
export function create(
  uri: Lsp.DocumentUri,
  languageId: string,
  version: number,
  content: string
): TextDocument {
  return new OhmDcocument(uri, languageId, version, content);
}

/**
 * Updates a TextDocument by modifying its content.
 *
 * @param document the document to update. Only documents created by TextDocument.create are valid inputs.
 * @param changes the changes to apply to the document.
 * @param version the changes version for the document.
 * @returns The updated TextDocument. Note: That's the same document instance passed in as first parameter.
 *
 */
export function update(
  document: TextDocument,
  changes: Lsp.TextDocumentContentChangeEvent[],
  version: number
): TextDocument {
  if (document instanceof OhmDcocument) {
    document.update(changes, version);
    document.fireChanges();
    return document;
  } else {
    throw new Error("Document.update: document must be created by Document.create");
  }
}

export function applyEdits(document: TextDocument, edits: Lsp.TextEdit[]): string {
  const text = document.getText();
  const sortedEdits = mergeSort(edits.map(getWellformedEdit), (a, b) => {
    const diff = a.range.start.line - b.range.start.line;
    if (diff === 0) {
      return a.range.start.character - b.range.start.character;
    }
    return diff;
  });
  let lastModifiedOffset = 0;
  const spans = [];
  for (const e of sortedEdits) {
    const startOffset = document.offsetAt(e.range.start);
    if (startOffset < lastModifiedOffset) {
      throw new Error("Overlapping edit");
    } else if (startOffset > lastModifiedOffset) {
      spans.push(text.substring(lastModifiedOffset, startOffset));
    }
    if (e.newText.length) {
      spans.push(e.newText);
    }
    lastModifiedOffset = document.offsetAt(e.range.end);
  }
  spans.push(text.substr(lastModifiedOffset));
  return spans.join("");
}

function mergeSort<T>(data: T[], compare: (a: T, b: T) => number): T[] {
  if (data.length <= 1) {
    // sorted
    return data;
  }
  const p = (data.length / 2) | 0;
  const left = data.slice(0, p);
  const right = data.slice(p);

  mergeSort(left, compare);
  mergeSort(right, compare);

  let leftIdx = 0;
  let rightIdx = 0;
  let i = 0;
  while (leftIdx < left.length && rightIdx < right.length) {
    const ret = compare(left[leftIdx], right[rightIdx]);
    if (ret <= 0) {
      // smaller_equal -> take left to preserve order
      data[i++] = left[leftIdx++];
    } else {
      // greater -> take right
      data[i++] = right[rightIdx++];
    }
  }
  while (leftIdx < left.length) {
    data[i++] = left[leftIdx++];
  }
  while (rightIdx < right.length) {
    data[i++] = right[rightIdx++];
  }
  return data;
}

enum CharCode {
  /**
   * The `\n` character.
   */
  LineFeed = 10,
  /**
   * The `\r` character.
   */
  CarriageReturn = 13,
}

function computeLineOffsets(text: string, isAtLineStart: boolean, textOffset = 0): number[] {
  const result: number[] = isAtLineStart ? [textOffset] : [];
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    if (ch === CharCode.CarriageReturn || ch === CharCode.LineFeed) {
      if (
        ch === CharCode.CarriageReturn &&
        i + 1 < text.length &&
        text.charCodeAt(i + 1) === CharCode.LineFeed
      ) {
        i++;
      }
      result.push(textOffset + i + 1);
    }
  }
  return result;
}

function getWellformedRange(range: Lsp.Range): Lsp.Range {
  const start = range.start;
  const end = range.end;
  if (start.line > end.line || (start.line === end.line && start.character > end.character)) {
    return { start: end, end: start };
  }
  return range;
}

function getWellformedEdit(textEdit: Lsp.TextEdit): Lsp.TextEdit {
  const range = getWellformedRange(textEdit.range);
  if (range !== textEdit.range) {
    return { newText: textEdit.newText, range };
  }
  return textEdit;
}

export type { OhmDcocument };
