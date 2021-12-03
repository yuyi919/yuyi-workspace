import "./setupLocale";

import * as monaco from "./monaco.all";

import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import "monaco-editor/esm/vs/language/html/monaco.contribution";
import "monaco-editor/esm/vs/basic-languages/monaco.contribution";

export type { worker } from "./monaco.all";

export * from "./monaco.all";
export type { editor as Editor, languages as Language } from "./monaco.all";
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
