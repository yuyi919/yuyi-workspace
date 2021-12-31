import "./setupLocale";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import "monaco-editor/esm/vs/basic-languages/monaco.contribution";
import "monaco-editor/esm/vs/language/html/monaco.contribution";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution";

export * from "monaco-editor/esm/vs/editor/editor.api";
export type {
  editor as Editor,
  languages as Language,
  worker,
} from "monaco-editor/esm/vs/editor/editor.api";
export { monaco };
export type { monaco as Monaco };

export type TMonaco = typeof monaco;
export type TLanguages = typeof monaco.languages;
export type TEditor = typeof monaco.editor;
