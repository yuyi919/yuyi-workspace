import languageConfigurationUrl from "vscode-advscript/language-configuration.json?url";
import AdvScriptPListUrl from "vscode-advscript/syntaxes/advscript.tmLanguage.json?url";
import FountainPListUrl from "vscode-advscript/syntaxes/fountain.tmlanguage.json?url";
import InjectUrl from "vscode-advscript/syntaxes/injection-inline-expression.tmLanguage.json?url";
import Inject2Url from "vscode-advscript/syntaxes/injection.json?url";
import { monaco, Uri } from "./monaco.export";
import { ScopeNameInfo } from "./provider";

export const languages: monaco.languages.ILanguageExtensionPoint[] = [
  {
    id: "advscript",
    aliases: ["AdvScript", "advscript"],
    extensions: [".adv", ".avs"],
    configuration: Uri.parse(languageConfigurationUrl),
  },
  {
    id: "fountain-script",
    extensions: [".adv", ".avs"],
    configuration: Uri.parse(languageConfigurationUrl),
  },
  {
    id: "typescript",
    extensions: [".ts", ".tsx"],
    configuration: Uri.parse(languageConfigurationUrl),
  },
];
export interface DemoScopeNameInfo extends ScopeNameInfo {
  scopeName?: string;
  path: string;
  embeddedLanguages?: Record<string, string>;
  injectTo?: string[];
}
// import HTMLPListUrl from "/textmate-syntaxes/HTML.plist?url";
// import TypeScriptPListUrl from "/textmate-syntaxes/TypeScript.plist?url";
// import CssPListUrl from "/textmate-syntaxes/css.plist?url";

export const grammerList = [
  {
    scopeName: "html",
    path: "${BASE_URL}textmate-syntaxes/html.plist",
  },
  {
    scopeName: "source.ts",
    path: "${BASE_URL}textmate-syntaxes/typescript.plist",
    language: "typescript",
  },
  {
    scopeName: "css",
    path: "${BASE_URL}textmate-syntaxes/css.plist",
  },
  {
    language: "fountain-script",
    scopeName: "text.source.fountain.script",
    path: FountainPListUrl,
    injections: ["inline-expression.injection", "todo-comment.injection", "text.source.advscript"],
    embeddedLanguages: {
      "text.source.advscript": "text.source.advscript",
      "source.ts": "typescript",
      "text.html.basic": "text.html.basic",
    },
  },
  {
    language: "advscript",
    scopeName: "text.source.advscript",
    path: AdvScriptPListUrl,
    injections: ["inline-expression.injection", "todo-comment.injection", "text.source.fountain.script"],
    embeddedLanguages: {
      "source.fountain": "text.source.fountain.script",
      "source.ts": "typescript",
    },
  },
  {
    scopeName: "todo-comment.injection",
    path: Inject2Url,
    injectTo: ["text.source.advscript", "text.source.fountain.script"],
  },
  {
    scopeName: "inline-expression.injection",
    path: InjectUrl,
    injectTo: ["text.source.advscript", "text.source.fountain.script"],
    embeddedLanguages: {
      "source.ts": "typescript",
      "source.advscript": "advscript",
    },
  },
] as DemoScopeNameInfo[];
