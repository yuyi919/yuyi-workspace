import { wireTmGrammars } from "monaco-editor-textmate";
import { Registry } from "monaco-textmate";
import {
  DocumentLine,
  isStatmentArray,
  LogickStatmentKind,
  NodeTypeKind,
} from "../../lib/interface";
import { getParserContext } from "../../lib/parser";
import { monaco, Monaco } from "../monaco.export";
import type { LanguageId, LanguageInfo } from "../register";
import { waitMonaco } from "../hackMonaco";

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
  monaco: Monaco;
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
  private monaco: Monaco;
  private registry: Registry;

  constructor(private config: SimpleLanguageInfoProviderConfig) {
    const { grammars, fetchGrammar, monaco } = config;
    this.monaco = monaco;

    this.registry = new Registry({
      async getGrammarDefinition(scopeName: ScopeName, dependentScope: string) {
        if (scopeName === "text.html.basic") {
          scopeName = "html";
        }
        if (scopeName === "source.ts") {
          scopeName = "typescript";
        }
        if (scopeName === "source.js") {
          scopeName = "typescript";
        }
        if (scopeName === "source.css") {
          scopeName = "css";
        }
        const scopeNameInfo = grammars[scopeName];
        if (scopeNameInfo == null) {
          console.log(`Unknown scope name: ${scopeName}`);
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
        console.log("getInjections", scopeName, grammar?.injections || []);
        return grammar ? grammar.injections : undefined;
      },

      // Note that nothing will display without the theme!
      // theme,
    });
  }

  /**
   * Be sure this is done after Monaco injects its default styles so that the
   * injected CSS overrides the defaults.
   */
  async injectCSS(editor: monaco.editor.ICodeEditor) {
    await waitMonaco();
    // const cssColors = this.registry.getColorMap();
    // // console.log(cssColors)
    // // monaco.languages.setColorMap(cssColors);

    // const colorMap = cssColors.map(Color.Format.CSS.parseHex);
    // // This is needed to ensure the minimap gets the right colors.
    // TokenizationRegistry.setColorMap(colorMap);
    // const css = generateTokensCSSForColorMap(colorMap);
    // const style = createStyleElementForColorsCSS();
    // style.innerHTML = css;

    await wireTmGrammars(
      monaco,
      this.registry,
      new Map(
        Object.entries({
          html: "text.html.basic",
          // pug: "text.pug",
          css: "source.css",
          // less: "source.css.less",
          // scss: "source.css.scss",
          typescript: "source.ts",
          javascript: "source.js",
          // javascriptreact: "source.js.jsx",
          // coffeescript: "source.coffee",
        })
      ),
      editor
    );
    console.log("loaded");
  }

  async fetchLanguageInfo(language: LanguageId): Promise<LanguageInfo> {
    const [configuration] = await Promise.all([this.config.fetchConfiguration(language)]);
    return {
      tokensProvider: null,
      configuration,
      highlightProvider: {
        provideDocumentHighlights(model, position, token) {
          console.log(model, position, token);
          return Promise.resolve([]);
        },
      },
      inlayHintsProvider: {
        provideInlayHints(model, range, token) {
          const tokens = [] as monaco.languages.InlayHint[];
          const context = getParserContext(model.id);
          for (const {
            text,
            source: {
              range: { line, lineEnd, col, colEnd },
            },
            mode,
            offsetCol,
          } of context.inlayHintTokens) {
            const position = {
              lineNumber: mode === "pre" ? line : lineEnd,
              column: (mode === "pre" ? col : colEnd) + (offsetCol ? offsetCol : 0),
            };
            if (range.containsPosition(position)) {
              tokens.push({ text, position, kind: monaco.languages.InlayHintKind.Type });
            }
          }
          return tokens;
        },
      },
      foldingRangeProvider: {
        provideFoldingRanges(model, context, token) {
          console.log("context", context);
          const ranges: monaco.languages.FoldingRange[] = [];
          const parsedDocument = getParserContext(model.id);
          // console.log(
          //   "provideFoldingRanges",
          //   model.getLineCount(),
          //   model.id,
          //   model,
          //   context,
          //   token
          // );

          const { statements } = parsedDocument;
          for (let i = 0, length = statements.length; i < length; i++) {
            //for each structToken, add a new range starting on the current structToken and ending on either the next one, or the last line of the document
            addRange(statements[i], statements[i + 1], model.getLineCount());
          }
          return ranges;
          function addRange(
            structItem: DocumentLine,
            nextStructItem: DocumentLine,
            lastline: number
          ) {
            if (isStatmentArray(structItem)) {
              const { line, lineEnd } = structItem.sourceNode.range;
              append(lineEnd, line);
              structItem.value.forEach((line, i, list) => addRange(line, list[i + 1], lastline));
            } else if (
              structItem.type === NodeTypeKind.Logic &&
              structItem.kind !== LogickStatmentKind.LET
            ) {
              const { line, lineEnd } = structItem.sourceNode.range;
              if (structItem.kind === LogickStatmentKind.IF) {
                structItem.blocks.forEach((line, i, list) => addRange(line, list[i + 1], lastline));
                return;
              }
              append(lineEnd, line);
            }
            // if (nextStructItem)
            //   //this is the last child, so the end of the folding range is the end of the parent
            //   lastline = nextStructItem.range.start.line;
            // ranges.push({
            //   start: structItem.range.start.line,
            //   end: lastline - 1,
            // });
            // if (structItem.children && structItem.children.length) {
            //   //for each child of the structtoken, repeat this process recursively
            //   for (let i = 0; i < structItem.children.length; i++) {
            //     addRange(structItem.children[i], structItem.children[i + 1], lastline);
            //   }
            // }
          }
          function append(lineEnd: number, line: number) {
            if (lineEnd - 1 > line) {
              ranges.push({
                start: line,
                end: lineEnd - 1,
              });
            }
          }
        },
      },
      formatProvider: {
        provideDocumentFormattingEdits(model, options, token) {
          console.log(model.getValue(), options, model.getEOL(), token);
          model.pushEditOperations(
            [],
            [
              {
                range: model.getFullModelRange(),
                text: "",
              },
            ],
            (r) => {
              return [];
            }
          );
          return [];
        },
      },
    };
  }
}
