import { CompletionItemKind, DiagnosticSeverity, Diagnostic } from "vscode-languageserver-protocol";
import { editor, MarkerSeverity, languages, Uri } from "../monaco.export";

export function toCompletionItemKind(kind: number) {
  const mItemKind = languages.CompletionItemKind;

  switch (kind) {
    case CompletionItemKind.Text:
      return mItemKind.Text;
    case CompletionItemKind.Method:
      return mItemKind.Method;
    case CompletionItemKind.Function:
      return mItemKind.Function;
    case CompletionItemKind.Constructor:
      return mItemKind.Constructor;
    case CompletionItemKind.Field:
      return mItemKind.Field;
    case CompletionItemKind.Variable:
      return mItemKind.Variable;
    case CompletionItemKind.Class:
      return mItemKind.Class;
    case CompletionItemKind.Interface:
      return mItemKind.Interface;
    case CompletionItemKind.Module:
      return mItemKind.Module;
    case CompletionItemKind.Property:
      return mItemKind.Property;
    case CompletionItemKind.Unit:
      return mItemKind.Unit;
    case CompletionItemKind.Value:
      return mItemKind.Value;
    case CompletionItemKind.Enum:
      return mItemKind.Enum;
    case CompletionItemKind.Keyword:
      return mItemKind.Keyword;
    case CompletionItemKind.Snippet:
      return mItemKind.Snippet;
    case CompletionItemKind.Color:
      return mItemKind.Color;
    case CompletionItemKind.File:
      return mItemKind.File;
    case CompletionItemKind.Reference:
      return mItemKind.Reference;
  }
  return mItemKind.Property;
}

export function fromCompletionItemKind(kind: languages.CompletionItemKind): CompletionItemKind {
  const mItemKind = languages.CompletionItemKind;

  switch (kind) {
    case mItemKind.Text:
      return CompletionItemKind.Text;
    case mItemKind.Method:
      return CompletionItemKind.Method;
    case mItemKind.Function:
      return CompletionItemKind.Function;
    case mItemKind.Constructor:
      return CompletionItemKind.Constructor;
    case mItemKind.Field:
      return CompletionItemKind.Field;
    case mItemKind.Variable:
      return CompletionItemKind.Variable;
    case mItemKind.Class:
      return CompletionItemKind.Class;
    case mItemKind.Interface:
      return CompletionItemKind.Interface;
    case mItemKind.Module:
      return CompletionItemKind.Module;
    case mItemKind.Property:
      return CompletionItemKind.Property;
    case mItemKind.Unit:
      return CompletionItemKind.Unit;
    case mItemKind.Value:
      return CompletionItemKind.Value;
    case mItemKind.Enum:
      return CompletionItemKind.Enum;
    case mItemKind.Keyword:
      return CompletionItemKind.Keyword;
    case mItemKind.Snippet:
      return CompletionItemKind.Snippet;
    case mItemKind.Color:
      return CompletionItemKind.Color;
    case mItemKind.File:
      return CompletionItemKind.File;
    case mItemKind.Reference:
      return CompletionItemKind.Reference;
  }
  return CompletionItemKind.Property;
}

export function toSeverity(lsSeverity: DiagnosticSeverity | number): monaco.MarkerSeverity {
  switch (lsSeverity) {
    case DiagnosticSeverity.Error:
      return MarkerSeverity.Error;
    case DiagnosticSeverity.Warning:
      return MarkerSeverity.Warning;
    case DiagnosticSeverity.Information:
      return MarkerSeverity.Info;
    case DiagnosticSeverity.Hint:
      return MarkerSeverity.Hint;
    default:
      return MarkerSeverity.Info;
  }
}

export function toDiagnostics(resource: Uri, diag: Diagnostic): editor.IMarkerData {
  const code = typeof diag.code === "number" ? String(diag.code) : <string>diag.code;
  return {
    severity: toSeverity(diag.severity),
    startLineNumber: diag.range.start.line + 1,
    startColumn: diag.range.start.character + 1,
    endLineNumber: diag.range.end.line + 1,
    endColumn: diag.range.end.character + 1,
    message: diag.message,
    code: code,
    source: diag.source,
  };
}
