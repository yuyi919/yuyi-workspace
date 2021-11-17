import "monaco-editor/esm/vs/editor/editor.all.js";

import "monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js";
import "monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js";
import "monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js";
import "monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js";

import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import "monaco-editor/esm/vs/language/html/monaco.contribution";
import "monaco-editor/esm/vs/basic-languages/monaco.contribution";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
export type { worker } from "monaco-editor/esm/vs/editor/editor.api";

export * from "monaco-editor/esm/vs/editor/editor.api";
export type {
  editor as Editor,
  languages as Language,
} from "monaco-editor/esm/vs/editor/editor.api";
// export type {
//   IDisposable,
//   IRange,
//   IEvent,
//   IKeyboardEvent,
//   IMarkdownString,
//   IMouseEvent,
//   IPosition,
//   IScrollEvent,
//   ISelection,
// } from "monaco-editor/esm/vs/editor/editor.api";

export { monaco };
export type { monaco as Monaco };

export type TMonaco = typeof monaco;
export type TLanguages = typeof monaco.languages;
export type TEditor = typeof monaco.editor;
