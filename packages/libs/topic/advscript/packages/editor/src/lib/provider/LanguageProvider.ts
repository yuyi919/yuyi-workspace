import { last } from "lodash";
import { Color } from "monaco-editor/esm/vs/base/common/color.js";
import { TokenizationRegistry } from "monaco-editor/esm/vs/editor/common/modes.js";
import { generateTokensCSSForColorMap } from "monaco-editor/esm/vs/editor/common/modes/supports/tokenization.js";
import { ThemeTrieElementRule, Theme } from "monaco-textmate/dist/typings/theme";
import {
  IGrammar,
  INITIAL,
  IOnigLib,
  IRawGrammar,
  IRawTheme,
  parseRawGrammar,
  Registry,
  StackElement,
} from "vscode-textmate";
import { Monaco, TMonaco } from "..";
import { waitMonaco } from "../hackMonaco";
import { monaco } from "../monaco.export";
import { LanguageId, LanguageInfo } from "../register";
import { TMToMonacoToken, TokenizerState } from "./TokenizerState";

/**
 * Basic provider to implement the fetchLanguageInfo() function needed to
 * power registerLanguages(). It is designed to fetch all resources
 * asynchronously based on a simple layout of static resources on the server.
 */

export class TmgLanguageProvider {
  private monaco: TMonaco;
  private registry: Registry;
  private tokensProviderCache: TokensProviderCache;

  private debug = false;

  constructor(private config: SimpleLanguageInfoProviderConfig) {
    const { grammars, fetchGrammar, theme, onigLib, monaco } = config;
    this.monaco = monaco;

    this.registry = new Registry({
      onigLib,
      async loadGrammar(scopeName: ScopeName): Promise<IRawGrammar | null> {
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
        // If this is a JSON grammar, filePath must be specified with a `.json`
        // file extension or else parseRawGrammar() will assume it is a PLIST
        // grammar.
        // console.log(`Finded scope name: ${scopeName}`);
        return parseRawGrammar(grammar, `${scopeName}.${type}`);
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

      // Note that nothing will display without the theme!
      theme,
    });

    this.tokensProviderCache = new TokensProviderCache(this.registry);
  }

  /**
   * Be sure this is done after Monaco injects its default styles so that the
   * injected CSS overrides the defaults.
   */
  injectCSS(editor?: Monaco.editor.IStandaloneCodeEditor) {
    _editor = editor;
    const cssColors = this.registry.getColorMap();
    // this.debug && console.debug(cssColors);
    // // This is needed to ensure the minimap gets the right colors.
    // const colorMap = cssColors.map(Color.Format.CSS.parseHex); //.map((c) => c.toString());
    // TokenizationRegistry.setColorMap(colorMap);
    // const css = generateTokensCSSForColorMap(colorMap);
    // const style = createStyleElementForColorsCSS();
    // style.innerHTML = css;
    // console.log(colorMap, TokenizationRegistry);
    monaco.languages.setColorMap(cssColors);
    const colorTheme = editor["_themeService"].getColorTheme();
    const _theme = colorTheme._tokenTheme as Theme;
    // @ts-expect-error
    const { _match } = _theme;
    // @ts-expect-error
    _theme._cache.clear();
    // @ts-expect-error
    _theme._match = (scopeName: string) => {
      const rule = _match.call(_theme, scopeName);
      try {
        let matched: ThemeTrieElementRule;
        // @ts-expect-error
        const rules = this.registry._syncRegistry?._theme.match(
          scopeName
        ) as ThemeTrieElementRule[];
        const filterRules = rules.filter((o, index, list) => {
          if (o.foreground > 1) {
            if (!o.parentScopes) return true;
            if (matched && !o.parentScopes) return false;
            const last = o.parentScopes[o.parentScopes.length - 1];
            const lastScope = scopeName.split(".").pop();
            if (last && last.split(".").includes(lastScope)) {
              matched = o;
              return true;
            }
            return false;
          }
        });
        // console.log(scopeName, rule, filterRules);
        if (matched || filterRules.length > 0) {
          const { background, fontStyle, foreground } = matched || last(filterRules);
          rule.acceptOverwrite(fontStyle, foreground, background);
          // @ts-expect-error
          _theme._cache.set(scopeName, rule);
        }
      } catch (error) {
        console.error(error);
      }
      return rule;
    };
    //   console.log(colorTheme, _theme, this.registry);
  }

  async fetchLanguageInfo(
    language: LanguageId,
    addition?: Partial<LanguageInfo> | (() => Promise<Partial<LanguageInfo>>)
  ): Promise<LanguageInfo> {
    await waitMonaco();
    if (addition instanceof Function) {
      addition = await addition();
    }
    const [tokensProvider, configuration] = await Promise.all([
      this.getTokensProviderForLanguage(language),
      this.config.fetchConfiguration(language),
    ]);
    return {
      tokensProvider,
      configuration,
      ...addition,
    };
  }

  private getTokensProviderForLanguage(language: string) {
    const scopeName = this.getScopeNameForLanguage(language);
    if (scopeName == null) {
      return Promise.resolve(null);
    }

    const encodedLanguageId = this.monaco.languages.getEncodedLanguageId(language);
    // Ensure the result of createEncodedTokensProvider() is resolved before
    // setting the language configuration.
    return this.tokensProviderCache.createTokensProvider(scopeName, encodedLanguageId);
  }

  private getScopeNameForLanguage(language: string): string | null {
    for (const [scopeName, grammar] of Object.entries(this.config.grammars)) {
      if (grammar.language === language) {
        return scopeName;
      }
    }
    return null;
  }
}
let _editor: Monaco.editor.IStandaloneCodeEditor;
class TokensProviderCache {
  private scopeNameToGrammar: Map<string, Promise<IGrammar>> = new Map();

  constructor(private registry: Registry) {}

  async createTokensProvider(
    scopeName: string,
    encodedLanguageId: number
  ): Promise<monaco.languages.TokensProvider | monaco.languages.EncodedTokensProvider> {
    const grammar = await this.getGrammar(scopeName, encodedLanguageId);
    // console.log("createEncodedTokensProvider", scopeName, grammar);
    return {
      getInitialState: () => new TokenizerState(INITIAL),
      tokenizeEncoded: (line: string, state: TokenizerState) => {
        const res = grammar.tokenizeLine2(line, state.ruleStack);
        return {
          endState: new TokenizerState(res.ruleStack),
          tokens: res.tokens,
        };
      },
      // tokenize: (line: string, state: TokenizerState) => {
      //   const res2 = grammar.tokenizeLine(line, state.ruleStack);
      //   if (!line.indexOf("@Foo (bar)[bar|bar]")) {
      //     console.log(
      //       line,
      //       res2.tokens,
      //       state
      //     );
      //   }
      //   return {
      //     endState: new TokenizerState(res2.ruleStack),
      //     tokens: res2.tokens.map((token) => ({
      //       ...token,
      //       // TODO: At the moment, monaco-editor doesn't seem to accept array of scopes
      //       scopes: _editor
      //         ? TMToMonacoToken(_editor, token.scopes) || token.scopes[token.scopes.length - 1]
      //         : token.scopes[token.scopes.length - 1],
      //     })),
      //   };
      // },
      // tokenize(
      //   line: string,
      //   state: monaco.languages.IState
      // ): monaco.languages.ILineTokens {
      //   const tokenizeLineResult2 = grammar.tokenizeLine(line, state as StackElement);
      //   const { tokens, ruleStack: endState } = tokenizeLineResult2;
      //   const lineTokens = tokens.map(({ scopes, startIndex }) => ({ startIndex, scopes:scopes[scopes.length - 1] })).flat(1)
      //   console.log("tokenize", line, lineTokens);
      //   return { tokens: [{startIndex: 0, scopes: 'comment'}], endState };
      // },
    };
  }

  getGrammar(scopeName: string, encodedLanguageId: number): Promise<IGrammar> {
    const grammar = this.scopeNameToGrammar.get(scopeName);
    if (grammar != null) {
      return grammar;
    }

    // This is defined in vscode-textmate and has optional embeddedLanguages
    // and tokenTypes fields that might be useful/necessary to take advantage of
    // at some point.
    const grammarConfiguration = {};
    // We use loadGrammarWithConfiguration() rather than loadGrammar() because
    // we discovered that if the numeric LanguageId is not specified, then it
    // does not get encoded in the TokenMetadata.
    //
    // Failure to do so means that the LanguageId cannot be read back later,
    // which can cause other Monaco features, such as "Toggle Line Comment",
    // to fail.
    console.debug("loadGrammarWithConfiguration", scopeName);
    const promise = this.registry
      .loadGrammarWithConfiguration(scopeName, encodedLanguageId, grammarConfiguration)
      .then((grammar: IGrammar | null) => {
        if (grammar) {
          return grammar;
        } else {
          throw Error(`failed to load grammar for ${scopeName}`);
        }
      })
      .catch((e) => {
        console.error("failed to load grammar", e);
        throw e;
      });
    this.scopeNameToGrammar.set(scopeName, promise);
    return promise;
  }
}
function createStyleElementForColorsCSS(): HTMLStyleElement {
  // We want to ensure that our <style> element appears after Monaco's so that
  // we can override some styles it inserted for the default theme.
  const style = document.createElement("style");

  // We expect the styles we need to override to be in an element with the class
  // name 'monaco-colors' based on:
  // https://github.com/microsoft/vscode/blob/f78d84606cd16d75549c82c68888de91d8bdec9f/src/vs/editor/standalone/browser/standaloneThemeServiceImpl.ts#L206-L214
  const monacoColors = document.getElementsByClassName("monaco-colors")[0];
  if (monacoColors) {
    monacoColors.parentElement?.insertBefore(style, monacoColors.nextSibling);
  } else {
    // Though if we cannot find it, just append to <head>.
    let { head } = document;
    if (head == null) {
      head = document.getElementsByTagName("head")[0];
    }
    head?.appendChild(style);
  }
  return style;
}
/** String identifier for a "scope name" such as 'source.cpp' or 'source.java'. */

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
  theme: IRawTheme;

  onigLib: Promise<IOnigLib>;
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
