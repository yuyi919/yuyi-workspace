/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  isCharacterDeclareKind,
  isDeclareKind,
  isMacroDeclare,
  isMacrosDeclareKind,
} from "@yuyi919/advscript-language-services";
import { isCharactersDeclare } from "@yuyi919/advscript-language-services";
import { isModifier } from "@yuyi919/advscript-language-services";
import { isOtherDeclare } from "@yuyi919/advscript-language-services";
import { Document, AdvscriptServices, ISerializedGast } from "@yuyi919/advscript-language-services";
import {
  AstNode,
  findLeafNodeAtOffset,
  LangiumDocument,
  LangiumServices,
  OperationCancelled,
  streamAllContents,
  streamContents,
} from "langium";
import { debounce } from "lodash";
import type * as Lsp from "vscode-languageserver-protocol";
import {
  TextDocumentItem,
  TextDocumentSyncKind,
  VersionedTextDocumentIdentifier,
} from "vscode-languageserver-protocol";
import type { Monaco, TMonaco } from "../lib";
import { MonacoToProtocolConverter } from "../lib/languageclient/monaco-converter";
import { createLangiumServices, ILSPModuleContext } from "./module";
import { ServiceMockConnectionWrapper } from "./ServiceMockConnection";
import { createRequest } from "./_utils";

export abstract class AdvScriptService {
  static serviceId = 0;
  protected m2p: MonacoToProtocolConverter;
  public id?: string;
  protected languageId?: string;
  protected services: AdvscriptServices;
  protected connection: ServiceMockConnectionWrapper;

  protected initialized: Lsp.InitializeResult;

  constructor(
    protected _monaco: TMonaco,
    factory: (context: ILSPModuleContext) => AdvscriptServices
  ) {
    this.m2p = new MonacoToProtocolConverter(_monaco);
    const connection = ServiceMockConnectionWrapper.create(_monaco);
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
    return (this.initialized = this.getInitializeResult(this.services));
  }

  async doDidChangeContent(
    uri: string,
    content: string,
    changes: Monaco.editor.IModelContentChange[]
  ) {
    const version = this._getScriptVersion(uri);
    const contentChanges = changes.map(({ range, rangeLength, text }) => ({
      range: this.m2p.asRange(range),
      rangeLength,
      text,
    }));
    // console.log("doDidChangeContent", contentChanges);
    ServiceMockConnectionWrapper.didChangeTextDocument(this.connection, {
      textDocument: VersionedTextDocumentIdentifier.create(uri, version),
      contentChanges,
    });
    this.doDiagnostics(uri);
    return this.getDiagnostics(uri);
  }

  getDiagnostics(uri: string) {
    return new Promise<Lsp.PublishDiagnosticsParams>((resolve) => {
      const dispose = ServiceMockConnectionWrapper.onDidDiagnostics(this.connection, (params) => {
        if (params.uri === uri) {
          // console.log("onDid getDiagnostics", params);
          resolve(params);
          dispose.dispose();
        }
      });
    });
  }

  async doDocumentLoaded(uri: string, content: string) {
    const version = this._getScriptVersion(uri);
    ServiceMockConnectionWrapper.didOpenTextDocument(this.connection, {
      textDocument: TextDocumentItem.create(uri, this.languageId, version, content),
    });
    return this.getDiagnostics(uri);
  }

  async cleanDiagnostics(uri: string) {
    this.connection.sendDiagnostics({
      uri,
      diagnostics: [],
      version: this._getScriptVersion(uri),
    });
  }

  diagnosticsRequest = createRequest(async (uri) => {
    const document = this.getDocumentWithUri(uri).textDocument;
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
  }, 200);

  protected doDiagnostics(uri: string) {
    this.diagnosticsRequest.do(uri);
  }

  async doProvideCompletionItems(params: Lsp.CompletionParams): Promise<Lsp.CompletionList> {
    const document = this.getDocumentWithParams(params);
    const result = await this.services.lsp.completion.CompletionProvider.getCompletion(
      document,
      params
    );
    return result;
  }

  async doFindReferences(params: Lsp.ReferenceParams): Promise<Lsp.Location[]> {
    const document = this.getDocumentWithParams(params);
    const result = await this.services.lsp.ReferenceFinder.findReferences(document, params);
    return result;
  }

  async doProvideCodeActions(
    params: Lsp.CodeActionParams
  ): Promise<(Lsp.Command | Lsp.CodeAction)[]> {
    if (!this.services.lsp.CodeActionProvider || !this.isDocumentLoaded(params)) {
      return;
    }
    const document = this.getDocumentWithParams(params);
    const result = await this.services.lsp.CodeActionProvider.getCodeActions(document, params);
    return result;
  }

  private isDocumentLoaded(params: Lsp.CodeActionParams): boolean {
    return !!this.services.documents.TextDocuments.get(params.textDocument.uri);
  }

  async doProvideDocumentSymbols(params: Lsp.DocumentSymbolParams): Promise<Lsp.DocumentSymbol[]> {
    const document = this.getDocumentWithParams(params);
    const result = await this.services.lsp.DocumentSymbolProvider.getSymbols(document, params);
    return result;
  }

  async doProvideDeclaration(params: Lsp.TextDocumentPositionParams): Promise<Lsp.Location[]> {
    return this.doProvideDefinition(params);
  }

  async doProvideDefinition(params: Lsp.TextDocumentPositionParams): Promise<Lsp.Location[]> {
    const document = this.getDocumentWithParams(params);
    const results = await this.services.lsp.GoToResolver.goToDefinition(document, params);
    return results.map((locat) => ({ range: locat.targetRange, uri: locat.targetUri }));
  }

  async doProvideDocumentHighlights(
    params: Lsp.DocumentHighlightParams
  ): Promise<Lsp.DocumentHighlight[]> {
    const document = this.getDocumentWithParams(params);
    const result = await this.services.lsp.DocumentHighlighter.findHighlights(document, params);
    return result;
  }

  async doProvideHover(params: Lsp.TextDocumentPositionParams): Promise<Lsp.Hover> {
    const document = this.getDocumentWithParams(params);
    const result = await this.services.lsp.HoverProvider.getHoverContent(document, params);
    return result;
  }

  async doProvideFoldingRanges(params: Lsp.FoldingRangeParams): Promise<Lsp.FoldingRange[]> {
    const document = this.getDocumentWithParams(params);
    const result = await this.services.lsp.FoldingRangeProvider.getFoldingRanges(document, params);
    return result;
  }

  async doProvideRenameEdits(params: Lsp.RenameParams): Promise<Lsp.WorkspaceEdit> {
    const document = this.getDocumentWithParams(params);
    const result = await this.services.lsp.RenameHandler.renameElement(document, params);
    return result;
  }

  async doResolveRenameLocation(params: Lsp.TextDocumentPositionParams) {
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

  async doDocumentSemanticTokens(params: Lsp.SemanticTokensParams | Lsp.SemanticTokensRangeParams) {
    const document = this.getDocumentWithParams(params);
    const result = await this.services.lsp.DocumentSemanticProvider.getDocumentSemanticTokens(
      document,
      (params as Lsp.SemanticTokensRangeParams).range
    );
    return result;
  }

  private getDocumentWithUri(uri: string) {
    return this.services.documents.LangiumDocuments.getOrCreateDocument(
      this._monaco.Uri.parse(uri)
    ) as LangiumDocument<Document>;
  }
  private getDocumentWithParams(params: { textDocument: Lsp.TextDocumentIdentifier }) {
    return this.getDocumentWithUri(params.textDocument.uri);
  }

  private findTextWithRange(document: LangiumDocument<AstNode>, result?: Lsp.Range) {
    const rootNode = document.parseResult?.value?.$cstNode;
    if (rootNode) {
      const offset = document.textDocument.offsetAt(result.start);
      const cstNode = findLeafNodeAtOffset(document.parseResult.value.$cstNode, offset);
      return cstNode.text;
    }
    return "";
  }

  getInitializeResult(services: LangiumServices, hasWorkspaceFolder?: boolean) {
    const result: Lsp.InitializeResult = {
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
        semanticTokensProvider: {
          legend: this.services.lsp.DocumentSemanticProvider.tokenLegend as any,
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

  async getScriptVersion(uri: string): Promise<number> {
    return this._getScriptVersion(uri);
  }

  async getSerializedGastProductions() {
    return this.services.parser.LangiumParser.getSerializedGastProductions() as ISerializedGast[];
  }

  protected abstract _getScriptVersion(uri: string): number;
}

export interface IAvsLanguageOptions {
  monaco?: TMonaco;
}
export class AvsLanguageService extends AdvScriptService {
  constructor(public options: IAvsLanguageOptions) {
    const { monaco: _monaco } = options;
    super(_monaco, (context) => createLangiumServices(_monaco, context));
    this.connection.onDidOpenTextDocument((param) => {
      this._preLoaded.push(param.textDocument.uri);
      // console.log("preload document", param.textDocument.uri);
      this._doDocumentLoaded();
    });
    this._loading = new _monaco.Emitter();
  }
  _loading: monaco.Emitter<void>;
  _preLoaded = [] as string[];
  loading = false;
  private _doDocumentLoaded = debounce(() => {
    const documents = this._preLoaded
      .splice(0, this._preLoaded.length)
      .map((uri) => this._monaco.Uri.parse(uri));
    console.log("loadDocuments", this._preLoaded);
    this._loading.fire();
    this.services.documents.DocumentBuilder.update(documents, []);
  }, 20);

  async doProvideCodeActions(params: Lsp.CodeActionParams) {
    // console.log("doProvideCodeActions", params);
    if (this._preLoaded.length > 0) {
      await new Promise<void>((resolve) => {
        const dispose = this._loading.event(() => {
          resolve();
          dispose.dispose();
        });
      });
    }
    return super.doProvideCodeActions(params);
  }

  async getLibFiles() {
    // @ts-ignore
    return (await (await monaco.languages.typescript.getTypeScriptWorker())()).getLibFiles();
  }

  protected _getScriptVersion(uri: string) {
    return 1;
  }
}

export interface WorkerAccessor<T> {
  (first: Lsp.URI, ...more: Lsp.URI[]): Promise<T>;
}
