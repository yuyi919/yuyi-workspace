import { monaco, Uri } from "./monaco.export";
import { ScopeNameInfo } from "./provider";

export const languages: monaco.languages.ILanguageExtensionPoint[] = [
  {
    id: "advscript",
    aliases: ["AdvScript", "advscript"],
    extensions: [".adv", ".avs"],
    configuration: Uri.parse("/node_modules/vscode-advscript/language-configuration.json"),
  },
  {
    id: "fountain-script",
    extensions: [".adv", ".avs"],
    configuration: Uri.parse("/node_modules/vscode-advscript/language-configuration.json"),
  },
  {
    id: "typescript",
    extensions: [".ts", ".tsx"],
    configuration: Uri.parse("/node_modules/vscode-advscript/language-configuration.json"),
  },
];
export interface DemoScopeNameInfo extends ScopeNameInfo {
  scopeName?: string;
  path: string;
  embeddedLanguages?: Record<string, string>;
  injectTo?: string[];
}
export const grammerList = [
  {
    scopeName: "html",
    path: "/HTML.plist",
  },
  {
    scopeName: "source.ts",
    path: "/TypeScript.plist",
    language: "typescript",
  },
  {
    scopeName: "css",
    path: "/css.plist",
  },
  {
    language: "fountain-script",
    scopeName: "text.source.fountain.script",
    path: "./syntaxes/fountain.tmlanguage.json",
    injections: ["inline-expression.injection", "todo-comment.injection"],
    embeddedLanguages: {
      "text.source.advscript": "text.source.advscript",
      "source.ts": "typescript",
      "text.html.basic": "text.html.basic",
    },
  },
  {
    language: "advscript",
    scopeName: "text.source.advscript",
    path: "./syntaxes/advscript.tmLanguage.json",
    injections: ["inline-expression.injection", "todo-comment.injection"],
    embeddedLanguages: {
      "source.fountain": "text.source.fountain.script",
      "source.ts": "typescript",
    },
  },
  {
    scopeName: "todo-comment.injection",
    path: "./syntaxes/injection.json",
    injectTo: ["text.source.advscript", "text.source.fountain.script"],
  },
  {
    scopeName: "inline-expression.injection",
    path: "./syntaxes/injection-inline-expression.tmLanguage.json",
    injectTo: ["text.source.advscript", "text.source.fountain.script"],
    embeddedLanguages: {
      "source.ts": "typescript",
      "source.advscript": "advscript",
    },
  },
] as DemoScopeNameInfo[];
