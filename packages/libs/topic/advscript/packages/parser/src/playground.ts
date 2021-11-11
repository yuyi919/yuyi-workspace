// import { language as mysqlLanguage } from "monaco-editor/esm/vs/basic-languages/mysql/mysql.js";
import { bootstrap, getWorker, LanguageInfo, monaco } from "./editor";
import { EmbeddedTypescriptWorker } from "./editor/provider/setupTsMode";
import { tryParseExpression } from "./lib/expression";
import { Zh_CN } from "./lib/expression/SyntaxError";
import { DocumentLine, isStatmentArray, LogickStatmentKind, NodeTypeKind } from "./lib/interface";
import { getParserContext } from "./lib/parser";
import { createScope } from "./lib/scope";
import file from "./line.avs";
// import * as monaco2 from "monaco-editor-core";
// import { listen } from "@codingame/monaco-jsonrpc";
import {
    Disposable, CancellationToken, Event, Emitter
} from 'vscode-jsonrpc';
console.log(Disposable, CancellationToken, Event, Emitter)
// import {
//   MessageConnection,
//   MonacoLanguageClient,
//   MonacoServices,
//   createConnection,
// } from "@codingame/monaco-languageclient";
// import { CloseAction, ErrorAction } from "vscode-languageclient";
// import ReconnectingWebSocket from "reconnecting-websocket";
// const url = createUrl("/sampleServer");
// const webSocket = createWebSocket(url);
// // listen when the web socket is opened
// listen({
//   webSocket,
//   onConnection: (connection) => {
//     // create and start the language client
//     const languageClient = createLanguageClient(connection);
//     const disposable = languageClient.start();
//     connection.onClose(() => disposable.dispose());
//   },
// });
// console.log(ErrorAction, CloseAction);

// function createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
//   return new MonacoLanguageClient({
//     name: "Sample Language Client",
//     clientOptions: {
//       // use a language id as a document selector
//       documentSelector: ["json"],
//       // disable the default error handler
//       errorHandler: {
//         error: () => ErrorAction.Continue,
//         closed: () => CloseAction.DoNotRestart,
//       },
//     },
//     // create a language client connection from the JSON RPC connection on demand
//     connectionProvider: {
//       get: (errorHandler, closeHandler) => {
//         return Promise.resolve(createConnection(connection, errorHandler, closeHandler));
//       },
//     },
//   });
// }
// function createUrl(path: string): string {
//   const protocol = location.protocol === "https:" ? "wss" : "ws";
//   return `${protocol}://${location.host}${location.pathname}${path}`;
// }

// function createWebSocket(url: string): WebSocket {
//   return new ReconnectingWebSocket(
//     url,
//     [],
//     Object.create({
//       maxReconnectionDelay: 10000,
//       minReconnectionDelay: 1000,
//       reconnectionDelayGrowFactor: 1.3,
//       connectionTimeout: 10000,
//       maxRetries: Infinity,
//       debug: false,
//     })
//   );
// }

// // install Monaco language client services
// MonacoServices.install(monaco2);
globalThis.parseExpression = (source: string) => tryParseExpression(source, Zh_CN);
globalThis.createScope = createScope;

function run() {
  const services = new EmbeddedTypescriptWorker();
  const languageId = "advscript";
  services.init().then(() => services.registerCompletionItemProvider("advscript"));
  services.addExtraLib(() => import("@addLibs/testLib/*").then((data) => data.default));
  bootstrap(monaco, languageId, async () => {
    await getWorker();
    return providers;
  }).then(async (helper) => {
    const editor = monaco.editor.create(document.querySelector("#editor"), {
      peekWidgetDefaultFocus: "tree",
      theme: "OneDark",
      automaticLayout: true,
      model: monaco.editor.createModel(file, languageId, monaco.Uri.file("./main.avs")),
      codeActionsOnSaveTimeout: 1000,
      "semanticHighlighting.enabled": true,
    });
    services.setupEditor(editor);
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
    editor.deltaDecorations(
      [],
      [
        {
          range: {
            startLineNumber: 61,
            startColumn: 5,
            endLineNumber: 62,
            endColumn: 5,
          },
          options: {
            // inlineClassName: "inlineClassName",
            // className: "className",
            // hoverMessage: { value: "hoverMessage"},
            // after: {
            //   content: "after"
            // },
            glyphMarginClassName: "errorIcon",
            glyphMarginHoverMessage: { value: "glyphMarginHoverMessage" },
          },
        },
      ]
    );
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
      // console.log("context", context);
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
