import * as lsTypes from "vscode-languageserver-types";
import { editor, MarkerSeverity, languages, Uri } from "../monaco.export";


export function toCompletionItemKind(kind: number) {
  const mItemKind = languages.CompletionItemKind;

  switch (kind) {
    case lsTypes.CompletionItemKind.Text:
      return mItemKind.Text;
    case lsTypes.CompletionItemKind.Method:
      return mItemKind.Method;
    case lsTypes.CompletionItemKind.Function:
      return mItemKind.Function;
    case lsTypes.CompletionItemKind.Constructor:
      return mItemKind.Constructor;
    case lsTypes.CompletionItemKind.Field:
      return mItemKind.Field;
    case lsTypes.CompletionItemKind.Variable:
      return mItemKind.Variable;
    case lsTypes.CompletionItemKind.Class:
      return mItemKind.Class;
    case lsTypes.CompletionItemKind.Interface:
      return mItemKind.Interface;
    case lsTypes.CompletionItemKind.Module:
      return mItemKind.Module;
    case lsTypes.CompletionItemKind.Property:
      return mItemKind.Property;
    case lsTypes.CompletionItemKind.Unit:
      return mItemKind.Unit;
    case lsTypes.CompletionItemKind.Value:
      return mItemKind.Value;
    case lsTypes.CompletionItemKind.Enum:
      return mItemKind.Enum;
    case lsTypes.CompletionItemKind.Keyword:
      return mItemKind.Keyword;
    case lsTypes.CompletionItemKind.Snippet:
      return mItemKind.Snippet;
    case lsTypes.CompletionItemKind.Color:
      return mItemKind.Color;
    case lsTypes.CompletionItemKind.File:
      return mItemKind.File;
    case lsTypes.CompletionItemKind.Reference:
      return mItemKind.Reference;
  }
  return mItemKind.Property;
}

export function fromCompletionItemKind(
  kind: languages.CompletionItemKind
): lsTypes.CompletionItemKind {
  const mItemKind = languages.CompletionItemKind;

  switch (kind) {
    case mItemKind.Text:
      return lsTypes.CompletionItemKind.Text;
    case mItemKind.Method:
      return lsTypes.CompletionItemKind.Method;
    case mItemKind.Function:
      return lsTypes.CompletionItemKind.Function;
    case mItemKind.Constructor:
      return lsTypes.CompletionItemKind.Constructor;
    case mItemKind.Field:
      return lsTypes.CompletionItemKind.Field;
    case mItemKind.Variable:
      return lsTypes.CompletionItemKind.Variable;
    case mItemKind.Class:
      return lsTypes.CompletionItemKind.Class;
    case mItemKind.Interface:
      return lsTypes.CompletionItemKind.Interface;
    case mItemKind.Module:
      return lsTypes.CompletionItemKind.Module;
    case mItemKind.Property:
      return lsTypes.CompletionItemKind.Property;
    case mItemKind.Unit:
      return lsTypes.CompletionItemKind.Unit;
    case mItemKind.Value:
      return lsTypes.CompletionItemKind.Value;
    case mItemKind.Enum:
      return lsTypes.CompletionItemKind.Enum;
    case mItemKind.Keyword:
      return lsTypes.CompletionItemKind.Keyword;
    case mItemKind.Snippet:
      return lsTypes.CompletionItemKind.Snippet;
    case mItemKind.Color:
      return lsTypes.CompletionItemKind.Color;
    case mItemKind.File:
      return lsTypes.CompletionItemKind.File;
    case mItemKind.Reference:
      return lsTypes.CompletionItemKind.Reference;
  }
  return lsTypes.CompletionItemKind.Property;
}

export function toSeverity(lsSeverity: lsTypes.DiagnosticSeverity | number): monaco.MarkerSeverity {
  switch (lsSeverity) {
    case lsTypes.DiagnosticSeverity.Error:
      return MarkerSeverity.Error;
    case lsTypes.DiagnosticSeverity.Warning:
      return MarkerSeverity.Warning;
    case lsTypes.DiagnosticSeverity.Information:
      return MarkerSeverity.Info;
    case lsTypes.DiagnosticSeverity.Hint:
      return MarkerSeverity.Hint;
    default:
      return MarkerSeverity.Info;
  }
}

export function toDiagnostics(resource: Uri, diag: lsTypes.Diagnostic): editor.IMarkerData {
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
