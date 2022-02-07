import {
  CompletionItemKind,
  CompletionTriggerKind,
  CompletionList,
  CodeActionKind,
  InsertTextMode,
  InsertTextFormat,
  MarkupKind,
} from "vscode-languageserver-protocol";

export {
  CompletionItemKind,
  CompletionTriggerKind,
  CompletionList,
  CodeActionKind,
  InsertTextMode,
  InsertTextFormat,
  MarkupKind,
};

import type * as LspTypes from "vscode-languageserver-protocol";

export type { LspTypes };

export const COMMAND_ID = {
  TriggerParameterHints: "editor.action.triggerParameterHints",
  ShowDefinitionPreviewHover: "editor.action.showDefinitionPreviewHover",
  TriggerSuggest: "editor.action.triggerSuggest",
  TriggerInlineSuggest: "editor.action.inlineSuggest.trigger",
  ShowHover: "editor.action.showHover",
} as const;
