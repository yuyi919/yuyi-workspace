// import { language as mysqlLanguage } from "monaco-editor/esm/vs/basic-languages/mysql/mysql.js";
import {
  getParserContext,
  DocumentLine,
  isStatmentArray,
  NodeTypeKind,
  LogickStatmentKind,
} from "@yuyi919/advscript-parser";
import { bootstrap, LanguageInfo, monaco } from "./lib";
import {  } from "./lib/monaco-textmate";
import { EmbeddedTypescriptWorker } from "./lib/provider/setupTsMode";
import file from "./line.avs?raw";
import { startClient, startClientService } from "./startClient";
function run() {
  const languageId = "advscript";
  // const services = new EmbeddedTypescriptWorker();
  // services.init().then(() => services.registerCompletionItemProvider("advscript"));
  // services.addExtraLib(() => import("@addLibs/testLib/*").then((data) => data.default));
  console.log(import("@addLibs/*.avs").then((data) => data.default))
  bootstrap(monaco, languageId, async () => {
    // return providers;
    return {};
  }).then(async (helper) => {
    // startClient();
    await startClientService(monaco);
//     monaco.editor.createModel(
//       `Characters: 
//   - Yukari (无感情, 沉默, 感叹)
//   - Akari (元气, 惊慌, 埋怨, 慌张)
//   - ？？？ (无声)

// `,
//       languageId,
//       monaco.Uri.file("./deps.avs")
//     );
    const model = monaco.editor.createModel(file, languageId, monaco.Uri.file("./main.avs"));
    const editor = monaco.editor.create(document.querySelector("#editor"), {
      peekWidgetDefaultFocus: "tree",
      theme: "OneDark",
      automaticLayout: true,
      model: model,
      codeActionsOnSaveTimeout: 1000,
      "semanticHighlighting.enabled": true,
      useShadowDOM: true,
      glyphMargin: true,
      lightbulb: {
        enabled: true,
      },
    });
    helper.injectCSS(editor);
    // services.setupEditor(editor);
    // console.log(editor.getModel().getLanguageId());
    // editor.revealRangeInCenter(range)
    globalThis.app = editor;
    // editor.setSelections([
    //   {
    //     selectionStartLineNumber: 61,
    //     selectionStartColumn: 5,
    //     positionLineNumber: 62,
    //     positionColumn: 5,
    //   },
    //   {
    //     selectionStartLineNumber: 62,
    //     selectionStartColumn: 5,
    //     positionLineNumber: 63,
    //     positionColumn: 5,
    //   },
    //   {
    //     selectionStartLineNumber: 63,
    //     selectionStartColumn: 5,
    //     positionLineNumber: 64,
    //     positionColumn: 5,
    //   },
    // ]);
    // editor.onDidChangeCursorSelection(e => {
    //   console.log(e)
    // })
    // monaco.editor.setModelMarkers(editor.getModel(), "advscript", [
    //   {
    //     severity: monaco.MarkerSeverity.Info,
    //     message: "test",
    //     startLineNumber: 61,
    //     startColumn: 5,
    //     endLineNumber: 62,
    //     endColumn: 5,
    //     code: {
    //       value: "app",
    //       target: services.getModel().uri,
    //     },
    //   },
    // ]);
    // editor.deltaDecorations(
    //   [],
    //   [
    //     {
    //       range: {
    //         startLineNumber: 61,
    //         startColumn: 5,
    //         endLineNumber: 62,
    //         endColumn: 5,
    //       },
    //       options: {
    //         // inlineClassName: "inlineClassName",
    //         // className: "className",
    //         // hoverMessage: { value: "hoverMessage"},
    //         // after: {
    //         //   content: "after"
    //         // },
    //         glyphMarginClassName: "errorIcon",
    //         glyphMarginHoverMessage: { value: "glyphMarginHoverMessage" },
    //       },
    //     },
    //   ]
    // );
  });
}
run();
const providers: Partial<LanguageInfo> = {
  completionItemProvider: {
    triggerCharacters: ["/", "|"],
    provideCompletionItems: async function (model, position) {
      const suggestions = [] as monaco.languages.CompletionItem[];
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });
      const matchArr = textUntilPosition.match(/(\S+)$/);
      // if (!matchArr) return [];
      if (matchArr) {
        const match = matchArr[0];
        // mysqlLanguage.keywords.forEach((item) => {
        //   if (item.indexOf(match) !== -1) {
        //     suggestions.push({
        //       label: item,
        //       kind: monaco.languages.CompletionItemKind.Keyword,
        //       insertText: item,
        //     });
        //   }
        // });
        // mysqlLanguage.operators.forEach((item) => {
        //   if (item.indexOf(match) !== -1) {
        //     suggestions.push({
        //       label: item,
        //       kind: monaco.languages.CompletionItemKind.Operator,
        //       insertText: item,
        //     });
        //   }
        // });
        // mysqlLanguage.builtinFunctions.forEach((item) => {
        //   if (item.indexOf(match) !== -1) {
        //     suggestions.push({
        //       label: item,
        //       kind: monaco.languages.CompletionItemKind.Function,
        //       insertText: item,
        //     });
        //   }
        // });
        if (match.startsWith("|")) {
          suggestions.push({
            label: "ifelse",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: ["if ${1:condition}", "$0", "|else", "", "|end"].join("\n"),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "If-Else Statement",
            range: void 0,
          });
        }
      }
      return {
        suggestions,
        incomplete: false,
      };
    },
  },
  highlightProvider: {
    provideDocumentHighlights(model, position, token) {
      console.log(model, position, token);
      return Promise.resolve([]);
    },
  },
  inlayHintsProvider: {
    provideInlayHints(model, range, token) {
      const tokens = [] as monaco.languages.InlayHint[];
      const context = getParserContext(model.uri.toString());
      if (!context) return tokens;
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
      // console.log("context", context);
      const ranges: monaco.languages.FoldingRange[] = [];
      const parsedDocument = getParserContext(model.uri.toString());
      if (!parsedDocument) return ranges;
      console.log(parsedDocument);
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
      function addRange(structItem: DocumentLine, nextStructItem: DocumentLine, lastline: number) {
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

import _ from "lodash";
import {
  CustomPatternMatcherFunc,
  IToken,
  createToken,
  createTokenInstance,
  Lexer,
} from "chevrotain";

function returnTokens() {
  // State required for matching the indentations
  let indentStack = [0];
  /**
   * This custom Token matcher uses Lexer context ("matchedTokens" and "groups" arguments)
   * combined with state via closure ("indentStack" and "lastTextMatched") to match indentation.
   *
   * @param  text - the full text to lex, sent by the Chevrotain lexer.
   * @param  offset - the offset to start matching in the text.
   * @param  matchedTokens - Tokens lexed so far, sent by the Chevrotain Lexer.
   * @param  groups - Token groups already lexed, sent by the Chevrotain Lexer.
   * @param  type - determines if this function matches Indent or Outdent tokens.
   * @returns
   */
  const matchIndentBase: CustomPatternMatcherFunc = (
    text,
    offset,
    matchedTokens,
    groups,
    type?: "indent" | "outdent"
  ) => {
    const noTokensMatchedYet = _.isEmpty(matchedTokens);
    const newLines = groups.nl;
    // console.log([...matchedTokens])
    const noNewLinesMatchedYet = _.isEmpty(newLines);
    const isFirstLine = noTokensMatchedYet && noNewLinesMatchedYet;
    const isStartOfLine =
      // only newlines matched so far
      (noTokensMatchedYet && !noNewLinesMatchedYet) ||
      // Both newlines and other Tokens have been matched AND the offset is just after the last newline
      (!noTokensMatchedYet && !noNewLinesMatchedYet && offset === _.last(newLines).startOffset + 1);

    // indentation can only be matched at the start of a line.
    if (isFirstLine || isStartOfLine) {
      let currIndentLevel = undefined;

      const wsRegExp = / +/y;
      wsRegExp.lastIndex = offset;
      const match = wsRegExp.exec(text);
      // possible non-empty indentation
      if (match !== null) {
        currIndentLevel = match[0].length;
      }
      // "empty" indentation means indentLevel of 0.
      else {
        currIndentLevel = 0;
      }

      const prevIndentLevel = _.last(indentStack);
      // deeper indentation
      if (currIndentLevel > prevIndentLevel && type === "indent") {
        indentStack.push(currIndentLevel);
        return match;
      }
      // shallower indentation
      else if (currIndentLevel < prevIndentLevel && type === "outdent") {
        const matchIndentIndex = _.findLastIndex(
          indentStack,
          (stackIndentDepth) => stackIndentDepth === currIndentLevel
        );

        // any outdent must match some previous indentation level.
        if (matchIndentIndex === -1) {
          throw Error(`invalid outdent at offset: ${offset}`);
        }

        const numberOfDedents = indentStack.length - matchIndentIndex - 1;

        // This is a little tricky
        // 1. If there is no match (0 level indent) than this custom token
        //    matcher would return "null" and so we need to add all the required outdents ourselves.
        // 2. If there was match (> 0 level indent) than we need to add minus one number of outsents
        //    because the lexer would create one due to returning a none null result.
        const iStart = match !== null ? 1 : 0;
        for (let i = iStart; i < numberOfDedents; i++) {
          indentStack.pop();
          matchedTokens.push(createTokenInstance(Outdent, "", NaN, NaN, NaN, NaN, NaN, NaN));
        }

        // even though we are adding fewer outdents directly we still need to update the indent stack fully.
        if (iStart === 1) {
          indentStack.pop();
        }
        return match;
      } else {
        // same indent, this should be lexed as simple whitespace and ignored
        return null;
      }
    } else {
      // indentation cannot be matched under other circumstances
      return null;
    }
  };

  // customize matchIndentBase to create separate functions of Indent and Outdent.
  const matchIndent = _.partialRight(matchIndentBase, "indent");
  const matchOutdent = _.partialRight(matchIndentBase, "outdent");

  const If = createToken({ name: "If", pattern: /if/ });
  const Else = createToken({ name: "Else", pattern: /else/ });
  const Print = createToken({ name: "Print", pattern: /print/ });
  const IntegerLiteral = createToken({ name: "IntegerLiteral", pattern: /\d+/ });
  const Colon = createToken({ name: "Colon", pattern: /:/ });
  const LParen = createToken({ name: "LParen", pattern: /\(/ });
  const RParen = createToken({ name: "RParen", pattern: /\)/ });
  const Spaces = createToken({
    name: "Spaces",
    pattern: / +/,
    group: Lexer.SKIPPED,
  });

  // newlines are not skipped, by setting their group to "nl" they are saved in the lexer result
  // and thus we can check before creating an indentation token that the last token matched was a newline.
  const Newline = createToken({
    name: "Newline",
    pattern: /\r?\n/,
    group: "nl",
  });
  console.log(Newline);

  // define the indentation tokens using custom token patterns
  const Indent = createToken({
    name: "Indent",
    pattern: matchIndent,
    // custom token patterns should explicitly specify the line_breaks option
    line_breaks: false,
  });
  const Outdent = createToken({
    name: "Outdent",
    pattern: matchOutdent,
    // custom token patterns should explicitly specify the line_breaks option
    line_breaks: false,
  });

  const customPatternLexer = new Lexer([
    Newline,
    // indentation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
    // Outdent must appear before Indent for handling zero spaces outdents.
    Outdent,
    Indent,

    Spaces,
    If,
    Else,
    Print,
    IntegerLiteral,
    Colon,
    LParen,
    RParen,
  ]);

  return {
    // for testing purposes
    Newline: IntegerLiteral,
    Indent: Indent,
    Outdent: Outdent,
    Spaces: Spaces,
    If: If,
    Else: Else,
    Print: Print,
    IntegerLiteral: IntegerLiteral,
    Colon: Colon,
    LParen: LParen,
    RParen: RParen,

    tokenize: function (text: string) {
      // have to reset the indent stack between processing of different text inputs
      indentStack = [0];

      const lexResult = customPatternLexer.tokenize(text);

      //add remaining Outdents
      while (indentStack.length > 1) {
        lexResult.tokens.push(createTokenInstance(Outdent, "", NaN, NaN, NaN, NaN, NaN, NaN));
        indentStack.pop();
      }

      if (lexResult.errors.length > 0) {
        throw new Error("sad sad panda lexing errors detected");
      }
      return lexResult;
    },
  };
}

function multiple() {
  // numbers Tokens
  const One = createToken({ name: "One", pattern: /1/ });
  const Two = createToken({ name: "Two", pattern: /2/ });
  const Three = createToken({ name: "Three", pattern: /3/ });

  // Letter Tokens
  const Alpha = createToken({ name: "Alpha", pattern: /A/ });
  const Beta = createToken({ name: "Beta", pattern: /B/ });
  const Gamma = createToken({ name: "Gamma", pattern: /G/ });

  // signs Tokens
  const Hash = createToken({ name: "Hash", pattern: /#/ });
  const Caret = createToken({ name: "Caret", pattern: /\^/ });
  const Amp = createToken({ name: "Amp", pattern: /&/ });

  // Tokens which control entering a new mode.
  const EnterNumbers = createToken({
    name: "EnterNumbers",
    pattern: /NUMBERS/,
    push_mode: "numbers_mode",
  });

  const EnterLetters = createToken({
    name: "EnterLetters",
    pattern: /LETTERS/,
    push_mode: "letter_mode",
  });

  const EnterSigns = createToken({
    name: "EnterSigns",
    pattern: /SIGNS/,
    push_mode: "signs_mode",
  });

  // Tokens which control exiting modes
  const ExitNumbers = createToken({
    name: "ExitNumbers",
    pattern: /EXIT_NUMBERS/,
    pop_mode: true,
  });

  const ExitLetter = createToken({
    name: "ExitLetter",
    pattern: /EXIT_LETTERS/,
    pop_mode: true,
  });

  const ExitSigns = createToken({
    name: "ExitSigns",
    pattern: /EXIT_SIGNS/,
    pop_mode: true,
  });

  const Whitespace = createToken({
    name: "Whitespace",
    pattern: /(\t| )/,
    group: Lexer.SKIPPED,
  });

  // Each key defines a Lexer mode's name.
  // And each value is an array of Tokens which are valid in this Lexer mode.
  const multiModeLexerDefinition = {
    modes: {
      numbers_mode: [
        One,
        Two,
        Three,
        ExitNumbers, // encountering an ExitNumbers Token will cause the lexer to revert to the previous mode
        EnterLetters, // switch to "letter_mode" after encountering "ENTER_Letter" while in "numbers_mode"
        Whitespace,
      ],
      letter_mode: [
        Alpha,
        Beta,
        Gamma,
        ExitLetter, // encountering an ExitNumbers Token will cause the lexer to revert to the previous mode
        EnterSigns, // switch to "signs_mode" after encountering "ENTER_SIGNS" while in "numbers_mode"
        EnterNumbers,
        Whitespace,
      ],
      signs_mode: [
        Hash,
        Caret,
        Amp,
        ExitSigns, // encountering an ExitSigns Token will cause the lexer to revert to the previous mode
        EnterNumbers, // switch to "numbers_mode" after encountering "ENTER_NUMBERS" while in "signs_mode"
        Whitespace,
      ],
    },

    defaultMode: "numbers_mode",
  };

  // Our new lexer now support 3 different modes
  // To mode switching logic works by using a mode stack and pushing and popping modes.
  // using the PUSH_MODE and POP_MODE static properties defined on the Token classes
  const MultiModeLexer = new Lexer(multiModeLexerDefinition, {});

  console.log(
    MultiModeLexer.tokenize("1 2 3 LETTERS A B NUMBERS 1 2 3 EXIT_NUMBERS G EXIT_LETTERS 1 2 3")
  );
}
function test2() {
  const input =
    "if 1\n" +
    "  if 2\n" +
    "    if 3\n" +
    "    print 666\n" +
    "    print 777\n" +
    "  else\n" +
    "    print 999\n";

  const lexResult = returnTokens().tokenize(input);
  console.log(lexResult);
}
if (process.env.NODE_ENV !== "production") {
  test2();
  multiple();
}
