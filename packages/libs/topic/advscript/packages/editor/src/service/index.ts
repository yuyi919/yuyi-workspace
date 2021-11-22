/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AstNode,
  findLeafNodeAtOffset,
  LangiumDocument,
  LangiumServices,
  OperationCancelled,
} from "langium";
import { _Connection } from "vscode-languageserver";
import {
  CodeActionParams,
  CompletionParams,
  DocumentHighlightParams,
  DocumentSymbolParams,
  FoldingRangeParams,
  InitializeResult,
  PublishDiagnosticsParams,
  ReferenceParams,
  RenameParams,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
} from "vscode-languageserver-protocol";
import { TextDocument } from "vscode-languageserver-textdocument";
import {
  CodeAction,
  Command,
  CompletionList,
  DocumentHighlight,
  DocumentSymbol,
  FoldingRange,
  Hover,
  Location,
  Range,
  TextDocumentIdentifier,
  TextDocumentItem,
  VersionedTextDocumentIdentifier,
  WorkspaceEdit,
} from "vscode-languageserver-types";
import { URI as Uri } from "vscode-uri";
import type { Monaco, TMonaco } from "../lib";
import { MonacoToProtocolConverter } from "../lib/languageclient/monaco-converter";
import { appendChanged } from "./adapter";
import { createLangiumServices, ILSPModuleContext } from "./module";
import { ServiceMockConnection } from "./ServiceMockConnection";
export abstract class AdvScriptService {
  static serviceId = 0;
  protected m2p: MonacoToProtocolConverter;
  public id?: string;
  protected languageId?: string;
  protected services: LangiumServices;
  protected connection: ServiceMockConnection;

  constructor(
    protected _monaco: TMonaco,
    factory: (context: ILSPModuleContext) => LangiumServices
  ) {
    this.m2p = new MonacoToProtocolConverter(_monaco);
    const connection = ServiceMockConnection.create(_monaco);
    const services = factory({ connection });
    this.languageId = services.LanguageMetaData.languageId;
    this.id = this.languageId + ":" + AdvScriptService.serviceId++;
    console.log(this.id, services);
    this.services = services;
    this.connection = connection;
    const documents = services.documents.TextDocuments;
    // Make the text document manager listen on the connection for open, change and close text document events.
    documents.listen(connection);
  }

  async doInitialize() {
    return this.getInitializeResult(this.services);
  }

  async doDidChangeContent(
    uri: string,
    content: string,
    changes: Monaco.editor.IModelContentChange[]
  ) {
    const version = await this.getScriptVersion(uri);
    const contentChanges = changes.map(({ range, rangeLength, text }) => ({
      range: this.m2p.asRange(range),
      rangeLength,
      text,
    }));
    console.log("doDidChangeContent", contentChanges);
    contentChanges.forEach((changed) => {
      appendChanged(uri, changed);
    });
    this.connection.didChangeTextDocument({
      textDocument: VersionedTextDocumentIdentifier.create(uri, version),
      contentChanges,
    });
    this.doDiagnostics(uri);
    return this.getDiagnostics();
  }

  getDiagnostics() {
    return new Promise<PublishDiagnosticsParams>((resolve) => {
      const dispose = this.connection.onDidDiagnostics(([params]: [PublishDiagnosticsParams]) => {
        resolve(params);
        dispose.dispose();
      });
    });
  }
  async doDocumentLoaded(uri: string, content: string) {
    const version = await this.getScriptVersion(uri);
    this.connection.didOpenTextDocument({
      textDocument: TextDocumentItem.create(uri, this.languageId, version, content),
    });
    this.services.documents.DocumentBuilder.update([this._monaco.Uri.parse(uri)], []);
    return this.getDiagnostics();
  }

  private pendingValidationRequests = new Map<string, number>();

  async cleanDiagnostics(uri: string) {
    this.connection.sendDiagnostics({
      uri,
      diagnostics: [],
      version: await this.getScriptVersion(uri),
    });
    // this._monaco.editor.setModelMarkers(uri, this.id, []);
  }

  async sendDiagnostics(uri: string) {
    this.connection.sendDiagnostics({
      uri,
      diagnostics: [],
      version: await this.getScriptVersion(uri),
    });
    // this._monaco.editor.setModelMarkers(uri, this.id, []);
  }

  private cleanPendingChange(document: TextDocument) {
    const request = this.pendingValidationRequests.get(document.uri);
    if (request !== undefined) {
      clearTimeout(request);
      this.pendingValidationRequests.delete(document.uri);
    }
  }
  protected doDiagnostics(uri: string) {
    const document = this.getDocumentWithUri(uri).textDocument;
    this.cleanPendingChange(document);
    this.pendingValidationRequests.set(
      document.uri,
      setTimeout(async () => {
        this.pendingValidationRequests.delete(document.uri);
        const text = document.getText();
        // console.log(text, text.length);
        if (text.length === 0) {
          this.cleanDiagnostics(uri);
          return;
        }
        try {
          await this.services.documents.DocumentBuilder.update([this._monaco.Uri.parse(uri)], []);
        } catch (err) {
          if (err !== OperationCancelled) {
            console.error("Error: ", err);
            throw err;
          }
        }
      }) as unknown as number
    );
  }

  async doProvideCompletionItems(params: CompletionParams): Promise<CompletionList> {
    const document = this.getDocumentWithParams(params);
    const result = await this.services.lsp.completion.CompletionProvider.getCompletion(
      document,
      params
    );
    return result;
  }

  async doFindReferences(params: ReferenceParams): Promise<Location[]> {
    const document = this.getDocumentWithParams(params);
    const result = await this.services.lsp.ReferenceFinder.findReferences(document, params);
    return result;
  }

  async doProvideCodeActions(params: CodeActionParams): Promise<(Command | CodeAction)[]> {
    await this.getScriptVersion(params.textDocument.uri);
    if (!this.services.lsp.CodeActionProvider) {
      return;
    }
    const document = this.getDocumentWithParams(params);
    const result = await this.services.lsp.CodeActionProvider.getCodeActions(document, params);
    return result;
  }

  async doProvideDocumentSymbols(params: DocumentSymbolParams): Promise<DocumentSymbol[]> {
    const document = this.getDocumentWithParams(params);
    const result = await this.services.lsp.DocumentSymbolProvider.getSymbols(document, params);
    return result;
  }

  async doProvideDeclaration(params: TextDocumentPositionParams): Promise<Location[]> {
    return this.doProvideDefinition(params);
  }

  async doProvideDefinition(params: TextDocumentPositionParams): Promise<Location[]> {
    const document = this.getDocumentWithParams(params);
    const results = await this.services.lsp.GoToResolver.goToDefinition(document, params);
    return results.map((locat) => ({ range: locat.targetRange, uri: locat.targetUri }));
  }

  async doProvideDocumentHighlights(params: DocumentHighlightParams): Promise<DocumentHighlight[]> {
    const document = this.getDocumentWithParams(params);
    const result = await this.services.lsp.DocumentHighlighter.findHighlights(document, params);
    return result;
  }

  async doProvideHover(params: TextDocumentPositionParams): Promise<Hover> {
    const document = this.getDocumentWithParams(params);
    const result = await this.services.lsp.HoverProvider.getHoverContent(document, params);
    return result;
  }

  async doProvideFoldingRanges(params: FoldingRangeParams): Promise<FoldingRange[]> {
    const document = this.getDocumentWithParams(params);
    const result = await this.services.lsp.FoldingRangeProvider.getFoldingRanges(document, params);
    return result;
  }

  async doProvideRenameEdits(params: RenameParams): Promise<WorkspaceEdit> {
    const document = this.getDocumentWithParams(params);
    const result = await this.services.lsp.RenameHandler.renameElement(document, params);
    return result;
  }

  async doResolveRenameLocation(params: TextDocumentPositionParams) {
    const document = this.getDocumentWithParams(params);
    const range = await this.services.lsp.RenameHandler.prepareRename(document, params);
    const text = range && this.findTextWithRange(document, range);
    if (text) {
      return {
        range,
        text,
      };
    }
  }

  private getDocumentWithUri(uri: string) {
    return this.services.documents.LangiumDocuments.getOrCreateDocument(
      this._monaco.Uri.parse(uri)
    );
  }
  private getDocumentWithParams(params: {
    /**
     * The document to rename.
     */
    textDocument: TextDocumentIdentifier;
  }) {
    return this.getDocumentWithUri(params.textDocument.uri);
  }

  private findTextWithRange(document: LangiumDocument<AstNode>, result?: Range) {
    const rootNode = document.parseResult?.value?.$cstNode;
    if (rootNode) {
      const offset = document.textDocument.offsetAt(result.start);
      const cstNode = findLeafNodeAtOffset(document.parseResult.value.$cstNode, offset);
      return cstNode.text;
    }
    return "";
  }

  getInitializeResult(services: LangiumServices, hasWorkspaceFolder?: boolean) {
    const result: InitializeResult = {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        // Tell the client that this server supports code completion.
        completionProvider: {},
        referencesProvider: {},
        documentSymbolProvider: {},
        definitionProvider: {},
        documentHighlightProvider: {},
        codeActionProvider: services.lsp.CodeActionProvider ? {} : undefined,
        foldingRangeProvider: {},
        hoverProvider: {},
        renameProvider: {
          prepareProvider: true,
        },
      },
    };
    if (hasWorkspaceFolder) {
      result.capabilities.workspace = {
        workspaceFolders: {
          supported: true,
        },
      };
    }

    return result;
  }

  abstract getScriptVersion(uri: string): Promise<number>;
}

export interface IAvsLanguageOptions {
  monaco?: TMonaco;
}
export class AvsLanguageService extends AdvScriptService {
  constructor(public options: IAvsLanguageOptions) {
    const { monaco: _monaco } = options;
    super(_monaco, (context) => createLangiumServices(_monaco, context));
    this._onDidChange = new _monaco.Emitter<void>();
  }

  _onDidChange: Monaco.Emitter<void>;

  get onDidChange() {
    return this._onDidChange.event;
  }

  protected applyChangeEvent() {
    this._onDidChange.fire();
  }

  async getLibFiles() {
    // @ts-ignore
    return (await (await monaco.languages.typescript.getTypeScriptWorker())()).getLibFiles();
  }

  async getScriptVersion(uri: string): Promise<number> {
    return 1;
  }
}

export interface WorkerAccessor<T> {
  (first: Uri, ...more: Uri[]): Promise<T>;
}
