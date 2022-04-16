import "./setupLocale";

import * as monaco from "monaco-editor";

export * from "monaco-editor";
export type {
  editor as Editor,
  languages as Language,
  worker,
} from "monaco-editor";
export { monaco };
export type { monaco as Monaco };

export type TMonaco = typeof monaco;
export type TLanguages = typeof monaco.languages;
export type TEditor = typeof monaco.editor;
