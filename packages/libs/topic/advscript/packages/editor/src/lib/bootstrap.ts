import { createOnigScanner, createOnigString, loadWASM } from "vscode-oniguruma";
import { DemoScopeNameInfo, grammerList, languages } from "./contributions";
import { TMonaco, monaco } from "./monaco.export";
import { ScopeName, TmgLanguageProvider, TextMateGrammar } from "./provider";
import { LanguageId, LanguageInfo, registerLanguages } from "./register";
import { rehydrateRegexps } from "./util";
import onigUrl from "vscode-oniguruma/release/onig.wasm?url";
import { convertTheme } from "./convertTheme";

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

  await loadVSCodeOnigurumWASM().then(loadWASM);
  const onigLib = Promise.resolve({
    createOnigScanner,
    createOnigString,
  });
  const provider = new TmgLanguageProvider({
    grammars,
    fetchGrammar,
    configurations: languages.map((language) => language.id),
    fetchConfiguration,
    theme,
    onigLib,
    monaco,
  });
  // provider.injectCSS();
  registerLanguages(
    languages,
    (language: LanguageId) => provider.fetchLanguageInfo(language, addition),
    monaco
  );
  return provider;
}

// Taken from https://github.com/microsoft/vscode/blob/829230a5a83768a3494ebbc61144e7cde9105c73/src/vs/workbench/services/textMate/browser/textMateService.ts#L33-L40
export async function loadVSCodeOnigurumWASM(): Promise<Response | ArrayBuffer> {
  const response = await fetch(onigUrl);
  const contentType = response.headers.get("content-type");
  if (contentType === "application/wasm") {
    return response;
  }

  // Using the response directly only works if the server sets the MIME type 'application/wasm'.
  // Otherwise, a TypeError is thrown when using the streaming compiler.
  // We therefore use the non-streaming compiler :(.
  return await response.arrayBuffer();
}
