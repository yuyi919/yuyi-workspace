import { castArray } from "lodash";
import { loadWASM } from "onigasm";
import { createOnigScanner, createOnigString } from "vscode-oniguruma";
import { monaco, Uri } from "./monaco.export";
import {
  ScopeName,
  ScopeNameInfo,
  SimpleLanguageInfoProvider,
  TextMateGrammar,
} from "./provider/monaco-textmate";
import { LanguageId, registerLanguages } from "./register";
import theme from "./theme";
import { rehydrateRegexps } from "./util";

export * from "./provider";
export type Monaco = typeof import("monaco-editor");

// 加载onigasm的WebAssembly文件
loadWASM("/onigasm.wasm");
const languages: monaco.languages.ILanguageExtensionPoint[] = [
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
];
interface DemoScopeNameInfo extends ScopeNameInfo {
  scopeName?: string;
  path: string;
  embeddedLanguages?: Record<string, string>;
  injectTo?: string[];
}
const grammerList = [
  {
    scopeName: "html",
    path: "/HTML.plist",
  },
  {
    scopeName: "typescript",
    path: "/TypeScript.plist",
  },
  {
    scopeName: "source.ts",
    path: "/TypeScript.plist",
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
export async function bootstrap(monaco: Monaco, language: LanguageId) {
  monaco.editor.defineTheme("OneDark", {
    base: "vs-dark",
    inherit: true,
    colors: theme.colors || {},
    rules: theme.tokenColors
      .map((setting) => {
        return castArray(setting.scope).map(
          (scope) => ({ token: scope, ...setting.settings } as monaco.editor.ITokenThemeRule)
        );
      })
      .flat(),
  });
  const grammars = grammerList.reduce((r, i) => {
    return {
      ...r,
      [i.scopeName]: {
        ...i,
        path: i.path.replace(/^\./, "/node_modules/vscode-advscript"),
      },
    };
  }, {} as { [scopeName: string]: DemoScopeNameInfo });

  const fetchGrammar = async (scopeName: ScopeName): Promise<TextMateGrammar> => {
    const { path } = grammars[scopeName];
    const uri = path;
    const response = await fetch(uri);
    const grammar = await response.text();
    const type = path.endsWith(".json") ? "json" : "plist";
    return { type, grammar };
  };

  const fetchConfiguration = async (
    languageId: LanguageId
  ): Promise<monaco.languages.LanguageConfiguration> => {
    const language = languages.find((o) => o.id === languageId);
    const uri = language.configuration.path;
    const response = await fetch(uri);
    const rawConfiguration = await response.text();
    return rehydrateRegexps(rawConfiguration);
  };

  // loadVSCodeOnigurumWASM().then(loadWASM)
  const onigLib = Promise.resolve({
    createOnigScanner,
    createOnigString,
  });
  const provider = new SimpleLanguageInfoProvider({
    grammars,
    fetchGrammar,
    configurations: languages.map((language) => language.id),
    fetchConfiguration,
    theme: {
      name: theme.name,
      settings: theme.tokenColors,
    },
    onigLib,
    monaco,
  });

  registerLanguages(
    languages,
    (language: LanguageId) => provider.fetchLanguageInfo(language),
    monaco
  );

  return {
    injectCSS(editor: monaco.editor.ICodeEditor) {
      return provider.injectCSS(editor);
    },
  };
}
