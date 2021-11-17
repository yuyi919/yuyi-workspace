import { monaco, Uri } from "./monaco.export";
import { ScopeNameInfo } from "./provider";
import languageConfigurationUrl from "vscode-advscript/language-configuration.json?url";
import HTMLPListUrl from "/HTML.plist?url";
import TypeScriptPListUrl from "/TypeScript.plist?url";
import CssPListUrl from "/css.plist?url";
import FountainPListUrl from "vscode-advscript/syntaxes/fountain.tmlanguage.json?url";
import AdvScriptPListUrl from "vscode-advscript/syntaxes/advscript.tmLanguage.json?url";
import InjectUrl from "vscode-advscript/syntaxes/injection-inline-expression.tmLanguage.json?url";
import Inject2Url from "vscode-advscript/syntaxes/injection.json?url";

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
export const grammerList = [
  {
    scopeName: "html",
    path: HTMLPListUrl,
  },
  {
    scopeName: "source.ts",
    path: TypeScriptPListUrl,
    language: "typescript",
  },
  {
    scopeName: "css",
    path: CssPListUrl,
  },
  {
    language: "fountain-script",
    scopeName: "text.source.fountain.script",
    path: FountainPListUrl,
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
    path: AdvScriptPListUrl,
    injections: ["inline-expression.injection", "todo-comment.injection"],
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
