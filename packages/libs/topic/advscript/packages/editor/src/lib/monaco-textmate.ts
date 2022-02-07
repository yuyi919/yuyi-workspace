import { loadWASM } from "onigasm";
import { TMonaco } from "./monaco.export";
import { DemoScopeNameInfo, grammerList, languages } from "./contributions";
import { convertTheme } from "./convertTheme";
import { monaco } from "./monaco.export";
import { ScopeName, SimpleLanguageInfoProvider, TextMateGrammar } from "./provider/monaco-textmate";
import { LanguageId, LanguageInfo, registerLanguages } from "./register";
import { rehydrateRegexps } from "./util";

export * from "./provider";

// 加载onigasm的WebAssembly文件
loadWASM("/onigasm.wasm");
export async function bootstrap(
  monaco: TMonaco,
  language: LanguageId,
  addition?: Partial<LanguageInfo> | (() => Promise<Partial<LanguageInfo>>)
) {
  const { theme, monacoTheme } = convertTheme();
  monaco.editor.defineTheme("OneDark", monacoTheme);
  const BASE_URL = import.meta.env.BASE_URL;
  const grammars = grammerList.reduce((r, i) => {
    return {
      ...r,
      [i.scopeName]: {
        ...i,
        path: i.path.replace("${BASE_URL}", BASE_URL),
      },
    };
  }, {} as { [scopeName: string]: DemoScopeNameInfo });
  console.debug(grammars);
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
    if (!language.configuration) return Promise.resolve(null);
    const uri = language.configuration.path;
    const response = await fetch(uri);
    const rawConfiguration = await response.text();
    return rehydrateRegexps(rawConfiguration);
  };

  const provider = new SimpleLanguageInfoProvider({
    grammars,
    fetchGrammar,
    configurations: languages.map((language) => language.id),
    fetchConfiguration,
    monaco,
  });

  registerLanguages(
    languages,
    (language: LanguageId) => provider.fetchLanguageInfo(language, addition),
    monaco
  );

  return {
    injectCSS(editor: monaco.editor.ICodeEditor) {
      return provider.injectCSS(editor);
    },
  };
}
