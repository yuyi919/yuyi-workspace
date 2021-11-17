import type { TypeScriptWorker } from "monaco-editor/esm/vs/language/typescript/monaco.contribution";

export abstract class Adapter {
  constructor(protected _worker: (...uris: monaco.Uri[]) => Promise<TypeScriptWorker>) {}

  // protected _positionToOffset(model: editor.ITextModel, position: monaco.IPosition): number {
  // 	return model.getOffsetAt(position);
  // }

  // protected _offsetToPosition(model: editor.ITextModel, offset: number): monaco.IPosition {
  // 	return model.getPositionAt(offset);
  // }

  protected _textSpanToRange(model: monaco.editor.ITextModel, span: ts.TextSpan): monaco.IRange {
    const p1 = model.getPositionAt(span.start);
    const p2 = model.getPositionAt(span.start + span.length);
    const { lineNumber: startLineNumber, column: startColumn } = p1;
    const { lineNumber: endLineNumber, column: endColumn } = p2;
    return { startLineNumber, startColumn, endLineNumber, endColumn };
  }
}

export function displayPartsToString(displayParts: ts.SymbolDisplayPart[] | undefined): string {
  if (displayParts) {
    return displayParts.map((displayPart) => displayPart.text).join("");
  }
  return "";
}

export function tagToString(tag: ts.JSDocTagInfo): string {
  let tagLabel = `*@${tag.name}*`;
  if (tag.name === "param" && tag.text) {
    const [paramName, ...rest] = tag.text;
    tagLabel += `\`${(paramName as any).text || paramName}\``;
    if (rest.length > 0) tagLabel += ` — ${rest.map((r) => (r as any).text || r).join(" ")}`;
  } else if (Array.isArray(tag.text)) {
    tagLabel += ` — ${tag.text.map((r) => r.text).join(" ")}`;
  } else if (tag.text) {
    tagLabel += ` — ${tag.text}`;
  }
  return tagLabel;
}
