// import { language as mysqlLanguage } from "monaco-editor/esm/vs/basic-languages/mysql/mysql.js";
import {
  getParserContext,
  DocumentLine,
  isStatmentArray,
  NodeTypeKind,
  LogickStatmentKind,
} from "@yuyi919/advscript-parser";
import { bootstrap, LanguageInfo, monaco } from "./lib";
import { EmbeddedTypescriptWorker } from "./lib/provider/setupTsMode";
import file from "./line.avs?raw";
import { startClient, startClientService } from "./startClient";
function run() {
  const languageId = "advscript";
  // const services = new EmbeddedTypescriptWorker();
  // services.init().then(() => services.registerCompletionItemProvider("advscript"));
  // services.addExtraLib(() => import("@addLibs/testLib/*").then((data) => data.default));
  bootstrap(monaco, languageId, async () => {
    // return providers;
    return {};
  }).then(async (helper) => {
    // startClient();
    await startClientService(monaco);
    const model = monaco.editor.createModel(file, languageId, monaco.Uri.file("./main.avs"));
    const editor = monaco.editor.create(document.querySelector("#editor"), {
      peekWidgetDefaultFocus: "tree",
      theme: "OneDark",
      automaticLayout: true,
      model: model,
      codeActionsOnSaveTimeout: 1000,
      "semanticHighlighting.enabled": true,
      glyphMargin: true,
      lightbulb: {
        enabled: true,
      },
    });
    // services.setupEditor(editor);
    helper.injectCSS();
    // console.log(editor.getModel().getLanguageId());
    // editor.revealRangeInCenter(range)
    globalThis.app = editor;
    editor.setSelections([
      {
        selectionStartLineNumber: 61,
        selectionStartColumn: 5,
        positionLineNumber: 62,
        positionColumn: 5,
      },
      {
        selectionStartLineNumber: 62,
        selectionStartColumn: 5,
        positionLineNumber: 63,
        positionColumn: 5,
      },
      {
        selectionStartLineNumber: 63,
        selectionStartColumn: 5,
        positionLineNumber: 64,
        positionColumn: 5,
      },
    ]);
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
