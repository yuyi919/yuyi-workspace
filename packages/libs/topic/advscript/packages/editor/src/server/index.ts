import * as rpc from "@codingame/monaco-jsonrpc";
import {
  CodeActionParams,
  Color,
  ColorInformation,
  ColorPresentation,
  ColorPresentationParams,
  Command,
  CompletionItem,
  CompletionList,
  Diagnostic,
  DidChangeTextDocumentParams,
  DocumentColorParams,
  DocumentRangeFormattingParams,
  DocumentSymbolParams,
  ExecuteCommandParams,
  FoldingRange,
  FoldingRangeParams,
  Hover,
  SymbolInformation,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  TextEdit,
} from "vscode-languageserver-protocol";
import { TextDocument } from "vscode-languageserver-textdocument";
import {
  createConnection,
  DidOpenTextDocumentParams,
  MessageReader,
  MessageWriter,
  TextDocumentChangeEvent,
  TextDocuments,
  _Connection as Connection,
} from "vscode-languageserver/lib/browser/main";
import { URI } from "vscode-uri";
import { AvsLanguageService } from "../service";

export function launch(socket: rpc.IWebSocket) {
  const reader = new rpc.WebSocketMessageReader(socket);
  const writer = new rpc.WebSocketMessageWriter(socket);
  return startServer(reader, writer);
}
export function startServer(reader: MessageReader, writer: MessageWriter): LanguageServer {
  const connection = createConnection(reader as any, writer as any, {});
  const server = new LanguageServer(connection);
  server.start();
  return server;
}

export class LanguageServer {
  protected workspaceRoot: URI | undefined;

  protected readonly documents = new TextDocuments(TextDocument);

  protected readonly service: AvsLanguageService;

  protected readonly pendingValidationRequests = new Map<string, number>();

  constructor(protected readonly connection: Connection) {
    this.documents.listen(this.connection);
    this.documents.onDidChangeContent((change) => this.doDidChangeContent(change));
    this.documents.onDidClose((event) => this.doDidClose(event));
    this.connection.onInitialize((params) => {
      if (params.workspaceFolders) {
        this.workspaceRoot = URI.file(params.workspaceFolders[0].uri);
      }
      this.connection.console.log("The server is initialized.");
      return {
        capabilities: {
          textDocumentSync: TextDocumentSyncKind.Incremental,
          codeActionProvider: true,
          completionProvider: {
            resolveProvider: true,
            triggerCharacters: ['"', ":", " ", "=", ".", "(", "[", "@", "\n"],
          },
          hoverProvider: true,
          documentSymbolProvider: true,
          documentRangeFormattingProvider: true,
          executeCommandProvider: {
            commands: ["json.documentUpper"],
          },
          colorProvider: true,
          foldingRangeProvider: true,
        },
      };
    });
    // this.connection.onDidChangeTextDocument((params) => this.onDidChangeTextDocument(params));
    // this.connection.onDidOpenTextDocument((params) => this.onDidOpenTextDocument(params));
    this.connection.onCodeAction((params) => this.doCodeAction(params));
    this.connection.onCompletion((params) => this.doCompletion(params));
    this.connection.onCompletionResolve((item) => this.doResolveCompletion(item));
    this.connection.onExecuteCommand((params) => this.doExecuteCommand(params));
    this.connection.onHover((params) => this.doHover(params));
    this.connection.onDocumentSymbol((params) => this.doDocumentSymbols(params));
    this.connection.onDocumentRangeFormatting((params) => this.doDocumentRangeFormatting(params));
    this.connection.onDocumentColor((params) => this.doDocumentColors(params));
    this.connection.onColorPresentation((params) => this.doColorPresentations(params));
    this.connection.onFoldingRanges((params) => this.doFoldingRanges(params));
  }

  private doDidClose(event: TextDocumentChangeEvent<TextDocument>) {
    this.connection.console.log("doDidClose:" + event.document.uri);
    this.cleanPendingValidation(event.document);
    this.cleanDiagnostics(event.document);
  }

  private onDidChangeTextDocument(params: DidChangeTextDocumentParams) {
    this.connection.console.log("onDidChangeTextDocument:" + params.textDocument.uri);
    // this.connection.console.log("onDidChangeTextDocument:" + JSON.stringify(this.documents.all()));
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return [];
    }
    this.connection.console.log(JSON.stringify(params.contentChanges));
  }
  private onDidOpenTextDocument(params: DidOpenTextDocumentParams) {
    this.connection.console.log("onDidOpenTextDocument:" + params.textDocument.uri);
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return [];
    }
    this.connection.console.log(JSON.stringify(params.textDocument));
  }
  private doDidChangeContent(change: TextDocumentChangeEvent<TextDocument>): any {
    return this.validate(change.document);
  }

  start() {
    this.connection.listen();
  }

  protected doFoldingRanges(params: FoldingRangeParams): FoldingRange[] {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return [];
    }
    // return this.jsonService.getFoldingRanges(document);
    return [];
  }

  /**
   * 文档中的颜色标记
   * @param params
   */
  protected doDocumentColors(params: DocumentColorParams): Thenable<ColorInformation[]> {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve([]);
    }
    // const jsonDocument = this.getJSONDocument(document);
    // return this.jsonService.findDocumentColors(document, jsonDocument);
    return Promise.resolve([
      {
        range: { start: { line: 1, character: 1 }, end: { line: 1, character: 1 } },
        color: Color.create(255, 255, 255, 1),
      },
    ] as ColorInformation[]);
  }

  protected doColorPresentations(params: ColorPresentationParams): ColorPresentation[] {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return [];
    }
    // const jsonDocument = this.getJSONDocument(document);
    // return this.jsonService.getColorPresentations(
    //   document,
    //   jsonDocument,
    //   params.color,
    //   params.range
    // );
    return [
      {
        label: "red",
        textEdit: {
          newText: "222",
          range: { start: { line: 2, character: 2 }, end: { line: 2, character: 5 } },
        },
      },
    ];
  }

  protected doCodeAction(params: CodeActionParams): Command[] {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return [];
    }
    return [
      {
        title: "Upper Case Document",
        command: "json.documentUpper",
        // Send a VersionedTextDocumentIdentifier
        arguments: [
          {
            ...params.textDocument,
            version: document.version,
          },
        ],
      },
    ];
  }

  protected doDocumentRangeFormatting(params: DocumentRangeFormattingParams): TextEdit[] {
    const document = this.documents.get(params.textDocument.uri);
    // return document ? this.jsonService.format(document, params.range, params.options) : [];
    return [];
  }

  protected doDocumentSymbols(params: DocumentSymbolParams): SymbolInformation[] {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return [];
    }
    // const jsonDocument = this.getJSONDocument(document);
    // return this.jsonService.findDocumentSymbols(document, jsonDocument);
    return [];
  }

  protected doExecuteCommand(params: ExecuteCommandParams): any {
    if (params.command === "json.documentUpper" && params.arguments) {
      const versionedTextDocumentIdentifier = params.arguments[0];
      const document = this.documents.get(versionedTextDocumentIdentifier.uri);
      if (document) {
        this.connection.workspace.applyEdit({
          documentChanges: [
            {
              textDocument: versionedTextDocumentIdentifier,
              edits: [
                {
                  range: {
                    start: { line: 0, character: 0 },
                    end: { line: Number.MAX_SAFE_INTEGER, character: Number.MAX_SAFE_INTEGER },
                  },
                  newText: document.getText().toUpperCase(),
                },
              ],
            },
          ],
        });
      }
    }
  }

  protected doHover(params: TextDocumentPositionParams): Thenable<Hover | null> {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }
    // const jsonDocument = this.getJSONDocument(document);
    // return this.jsonService.doHover(document, params.position, jsonDocument);
    return Promise.resolve(null);
  }

  // protected async resolveSchema(url: string): Promise<string> {
  //   const uri = URI.parse(url);
  //   if (uri.scheme === "file") {
  //     return new Promise<string>((resolve, reject) => {
  //       fs.readFile(uri.fsPath, "UTF-8", (err, result) => {
  //         err ? reject("") : resolve(result.toString());
  //       });
  //     });
  //   }
  //   try {
  //     const response = await xhr({ url, followRedirects: 5 });
  //     return response.responseText;
  //   } catch (error) {
  //     return Promise.reject(
  //       error.responseText || getErrorStatusDescription(error.status) || error.toString()
  //     );
  //   }
  // }

  protected doResolveCompletion(item: CompletionItem): Thenable<CompletionItem> {
    // return this.jsonService.doResolve(item);
    return Promise.resolve(item);
  }

  protected doCompletion(params: TextDocumentPositionParams): Thenable<CompletionList | null> {
    const document = this.documents.get(params.textDocument.uri);
    this.connection.console.log("doCompletion:" + params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }
    // const jsonDocument = this.getJSONDocument(document);
    // return this.jsonService.doComplete(document, params.position, jsonDocument);
    return Promise.resolve(null);
  }

  protected validate(document: TextDocument): void {
    try {
      this.connection.console.log("doValidate:" + document.uri);
      // this.connection.console.log("doValidate:" + document.getText());
      // this.connection.console.log("doValidate:" + JSON.stringify(this.documents.all()));
    } catch (error) {
      this.connection.console.error(error.stack);
    }
    this.cleanPendingValidation(document);
    this.pendingValidationRequests.set(
      document.uri,
      setTimeout(() => {
        this.pendingValidationRequests.delete(document.uri);
        this.doValidate(document);
      }) as unknown as number
    );
  }

  protected cleanPendingValidation(document: TextDocument): void {
    const request = this.pendingValidationRequests.get(document.uri);
    if (request !== undefined) {
      clearTimeout(request);
      this.pendingValidationRequests.delete(document.uri);
    }
  }

  protected doValidate(document: TextDocument): void {
    if (document.getText().length === 0) {
      this.cleanDiagnostics(document);
      return;
    }

    // const jsonDocument = this.getJSONDocument(document);
    // this.jsonService
    //   .doValidation(document, jsonDocument)
    //   .then((diagnostics) => this.sendDiagnostics(document, diagnostics));
  }

  protected cleanDiagnostics(document: TextDocument): void {
    this.sendDiagnostics(document, []);
  }

  protected sendDiagnostics(document: TextDocument, diagnostics: Diagnostic[]): void {
    this.connection.sendDiagnostics({
      uri: document.uri,
      diagnostics,
    });
  }

  // protected getJSONDocument(document: TextDocument): JSONDocument {
  //   return this.jsonService.parseJSONDocument(document);
  // }
}
