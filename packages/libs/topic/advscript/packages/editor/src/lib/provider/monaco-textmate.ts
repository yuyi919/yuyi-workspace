import { wireTmGrammars } from "monaco-editor-textmate";
import { INITIAL } from "monaco-textmate";
import { Registry } from "monaco-textmate";
import { monaco, TMonaco } from "../monaco.export";
import type { LanguageId, LanguageInfo } from "../register";
import { waitMonaco } from "../hackMonaco";
import { TMToMonacoToken } from "monaco-editor-textmate/src/tm-to-monaco-token";
import { TokenizerState } from "./TokenizerState";
export type ScopeName = string;

export type TextMateGrammar = {
  type: "json" | "plist";
  grammar: string;
};

export type SimpleLanguageInfoProviderConfig = {
  // Key is a ScopeName.
  grammars: { [scopeName: string]: ScopeNameInfo };

  fetchGrammar: (scopeName: ScopeName) => Promise<TextMateGrammar>;

  configurations: LanguageId[];

  fetchConfiguration: (language: LanguageId) => Promise<monaco.languages.LanguageConfiguration>;

  // This must be available synchronously to the SimpleLanguageInfoProvider
  // constructor, so the user is responsible for fetching the theme data rather
  // than SimpleLanguageInfoProvider.
  monaco: TMonaco;
};

export interface ScopeNameInfo {
  /**
   * If set, this is the id of an ILanguageExtensionPoint. This establishes the
   * mapping from a MonacoLanguage to a TextMate grammar.
   */
  language?: LanguageId;

  /**
   * Scopes that are injected *into* this scope. For example, the
   * `text.html.markdown` scope likely has a number of injections to support
   * fenced code blocks.
   */
  injections?: ScopeName[];
}

/**
 * Basic provider to implement the fetchLanguageInfo() function needed to
 * power registerLanguages(). It is designed to fetch all resources
 * asynchronously based on a simple layout of static resources on the server.
 */
export class SimpleLanguageInfoProvider {
  private monaco: TMonaco;
  private registry: Registry;

  constructor(private config: SimpleLanguageInfoProviderConfig) {
    const { grammars, fetchGrammar, monaco } = config;
    this.monaco = monaco;

    this.registry = new Registry({
      async getGrammarDefinition(scopeName: ScopeName, dependentScope: string) {
        this.debug && console.debug(`Load Grammar: ${scopeName}`);
        if (scopeName === "text.html.basic") {
          scopeName = "html";
        }
        if (scopeName === "source.css") {
          scopeName = "css";
        }
        if (scopeName === "source.js") {
          scopeName = "source.ts";
        }
        const scopeNameInfo = grammars[scopeName];
        if (scopeNameInfo == null) {
          this.debug && console.debug(`Unknown scope name: ${scopeName}`);
          return null;
        }
        const { type, grammar } = await fetchGrammar(scopeName);
        // console.log(`finded scope name: ${scopeName}, ${type}`);
        // If this is a JSON grammar, filePath must be specified with a `.json`
        // file extension or else parseRawGrammar() will assume it is a PLIST
        // grammar.
        // return parseRawGrammar(grammar, `example.${}`);
        return { format: type as "json", content: grammar };
      },

      /**
       * For the given scope, returns a list of additional grammars that should be
       * "injected into" it (i.e., a list of grammars that want to extend the
       * specified `scopeName`). The most common example is other grammars that
       * want to "inject themselves" into the `text.html.markdown` scope so they
       * can be used with fenced code blocks.
       *
       * In the manifest of a VS Code extension, a grammar signals that it wants
       * to do this via the "injectTo" property:
       * https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide#injection-grammars
       */
      getInjections(scopeName: ScopeName): string[] | undefined {
        const grammar = grammars[scopeName];
        this.debug && console.debug("getInjections", scopeName, grammar?.injections || []);
        return grammar ? grammar.injections : [];
      },
    });
  }

  /**
   * Be sure this is done after Monaco injects its default styles so that the
   * injected CSS overrides the defaults.
   */
  async injectCSS(editor: monaco.editor.ICodeEditor) {
    await waitMonaco();
    const languages = new Map(
      Object.entries({
        html: "text.html.basic",
        css: "source.css",
        typescript: "source.ts",
        javascript: "source.js",
        "fountain-script": "text.source.fountain.script",
        advscript: "text.source.advscript",
      })
    );
    await Promise.all(
      Array.from(languages.keys()).map(async (languageId) => {
        const grammar = await this.registry.loadGrammar(languages.get(languageId));
        monaco.languages.setTokensProvider(languageId, {
          getInitialState: () => new TokenizerState(INITIAL),
          tokenize: (line: string, state: TokenizerState) => {
            const res = grammar.tokenizeLine(line, state.ruleStack);
            console.log(
              line,
              res.tokens.map((token) => ({
                ...token,
                // TODO: At the moment, monaco-editor doesn't seem to accept array of scopes
                scopes: editor
                  ? TMToMonacoToken(editor, token.scopes)
                  : token.scopes[token.scopes.length - 1],
              }))
            );
            return {
              endState: new TokenizerState(res.ruleStack),
              tokens: res.tokens.map((token) => ({
                ...token,
                // TODO: At the moment, monaco-editor doesn't seem to accept array of scopes
                scopes: editor
                  ? TMToMonacoToken(editor, token.scopes)
                  : token.scopes[token.scopes.length - 1],
              })),
            };
          },
        });
      })
    );
    // await wireTmGrammars(
    //   monaco,
    //   this.registry,
    //   new Map(
    //     Object.entries({
    //       html: "text.html.basic",
    //       css: "source.css",
    //       typescript: "source.ts",
    //       javascript: "source.js",
    //       "fountain-script": "text.source.fountain.script",
    //       advscript: "text.source.advscript",
    //     })
    //   ),
    //   editor
    // );
    console.log("loaded");
  }

  async fetchLanguageInfo(
    language: LanguageId,
    addition?: Partial<LanguageInfo> | (() => Promise<Partial<LanguageInfo>>)
  ): Promise<LanguageInfo> {
    await waitMonaco();
    if (addition instanceof Function) {
      addition = await addition();
    }
    const configuration = await this.config.fetchConfiguration(language);
    return {
      tokensProvider: null,
      configuration,
      ...addition,
    };
  }
}
