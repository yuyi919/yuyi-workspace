import type * as Lsp from "vscode-languageserver-protocol";
import { TextDocumentIdentifier } from "vscode-languageserver-protocol";
import { MonacoEditorRegisterAdapter } from "./lib";
import { Monaco, TMonaco } from "./lib/monaco.export";
import type { AvsLanguageService } from "./service";

class Waiter<T> {
  protected _wait: Promise<T>;
  protected _resolved = false;
  protected resolve: ((value: T) => void)[] = [];
  wait() {
    return this._wait;
  }
  createNext() {
    this._wait = new Promise<T>((_resolve) => {
      this.resolve.push(_resolve);
    });
    return {
      next: (value: T) => {
        if (this.resolve.length > 0) {
          this.resolve.forEach((resolve) => resolve(value));
          this.resolve = [];
        }
      },
    };
  }
}

export class MonacoServiceWrapper extends MonacoEditorRegisterAdapter {
  private initializeResult: Lsp.InitializeResult<any>;
  constructor(
    public _monaco: TMonaco,
    public service: AvsLanguageService,
    private languageId: string
  ) {
    super(_monaco);
  }

  attached = new Set<string>();

  async initialize(model?: Monaco.editor.ITextModel) {
    if (!this.initializeResult) {
      globalThis.setImmediate = (<TArgs extends any[]>(
        callback: (...args: TArgs) => void,
        ...args: TArgs
      ) => globalThis.setTimeout(callback, 5, ...args)) as any;
      this.initializeResult = await this.service.doInitialize();
      this.addDocumentsHandler();
      this.addCompletionHandler();
      this.addFindReferencesHandler();
      this.addDocumentSymbolHandler();
      this.addGotoDefinitionHandler();
      this.addDocumentHighlightsHandler();
      this.addFoldingRangeHandler();
      this.addCodeActionHandler();
      this.addRenameHandler();
      this.addHoverHandler();
      // console.log("Adapter init", this);
    }
  }

  addDocumentsHandler() {
    this.addDispose(
      this._monaco.editor.onDidCreateModel((model) => {
        const MONACO_URI: Monaco.Uri = model.uri;
        const MONACO_URI_STRING = MONACO_URI.toString();
        const { next } = this.DiagnosticsTick.createNext();
        this.service.doDocumentLoaded(MONACO_URI_STRING, model.getValue()).then((params) => {
          if (this.attached.has(MONACO_URI_STRING)) {
            this.updateModelMarkers(model, params);
          }
          next(params);
        });
        this.addDispose(
          model.onDidChangeAttached(() => {
            this.attached.add(MONACO_URI_STRING);
            console.log("onDidChangeAttached", MONACO_URI_STRING);
          })
        );
        let requestId = -1;
        this.addDispose(
          model.onDidChangeContent((event) => {
            if (this.attached.has(MONACO_URI_STRING)) {
              const { next } = this.DiagnosticsTick.createNext();
              const id = ++requestId;
              this.service
                .doDidChangeContent(MONACO_URI_STRING, model.getValue(), event.changes)
                .then((params) => {
                  // console.log("check", id, requestId);
                  if (id === requestId) {
                    this.updateModelMarkers(model, params);
                    requestId = -1;
                    next(params);
                  }
                });
            }
          })
        );
      })
    );
  }
  DiagnosticsTick = new Waiter<Lsp.PublishDiagnosticsParams>();

  protected updateModelMarkers = (
    model: Monaco.editor.ITextModel,
    params: Lsp.PublishDiagnosticsParams
  ) => {
    // console.log("updateModelMarkers", params);
    this._monaco.editor.setModelMarkers(
      model,
      this.languageId,
      this.p2m.asDiagnostics(params.diagnostics)
    );
  };

  addCompletionHandler() {
    this.languages.registerCompletionItemProvider(
      [this.languageId],
      {
        provideCompletionItems: this.bind(this.service.doProvideCompletionItems),
        resolveCompletionItem: async (item, token) => {
          const resultItem = await this.service.doResolveCompletionItem(item);
          if (!token.isCancellationRequested) return resultItem;
        },
      },
      ...(this.initializeResult.capabilities.completionProvider.triggerCharacters || [])
    );
    this.languages.registerInlineCompletionItemProvider([this.languageId], {
      provideCompletionItems: this.bind(this.service.doProvideInlineCompletionItems),
    });
  }

  addFindReferencesHandler() {
    this.languages.registerReferenceProvider([this.languageId], {
      provideReferences: this.bind(this.service.doFindReferences),
    });
  }

  addCodeActionHandler() {
    const providerOptions = this.initializeResult.capabilities.codeActionProvider;
    this.languages.registerCodeActionsProvider([this.languageId], {
      ...(providerOptions instanceof Object ? providerOptions : {}),
      provideCodeActions: this.bind(this.service.doProvideCodeActions),
    });
  }

  addDocumentSymbolHandler() {
    this.languages.registerDocumentSymbolProvider([this.languageId], {
      provideDocumentSymbols: this.bind(this.service.doProvideDocumentSymbols),
    });
    const { semanticTokensProvider } = this.initializeResult.capabilities;
    if (semanticTokensProvider) {
      this.languages.registerDocumentSemanticTokensProvider(
        [this.languageId],
        {
          provideDocumentSemanticTokens: this.bind(this.service.doDocumentSemanticTokens),
        },
        semanticTokensProvider.legend
      );
      this.languages.registerLinkedEditingRangeProvider([this.languageId], {
        provideLinkedEditingRanges: async (params) => {
          // console.log('provideLinkedEditingRanges', params)
          const data = await this.service.doLinkedEditing(params);
          // console.log('provideLinkedEditingRanges data', data)
          return data && { ranges: data };
        },
      });
      this.languages.registerDocumentRangeSemanticTokensProvider(
        [this.languageId],
        {
          provideDocumentRangeSemanticTokens: this.bind(this.service.doDocumentSemanticTokens),
        },
        semanticTokensProvider.legend
      );
    }
  }
  addGotoDefinitionHandler() {
    this.languages.registerDefinitionProvider([this.languageId], {
      provideDefinition: this.bind(this.service.doProvideDefinition),
    });
    this.languages.registerTypeDefinitionProvider([this.languageId], {
      provideTypeDefinition: this.bind(this.service.doProvideDefinition),
    });
  }

  addDocumentHighlightsHandler() {
    this.languages.registerDocumentHighlightProvider([this.languageId], {
      provideDocumentHighlights: this.bind(this.service.doProvideDocumentHighlights),
    });
  }

  addHoverHandler() {
    this.languages.registerHoverProvider([this.languageId], {
      provideHover: this.bind(this.service.doProvideHover),
    });
  }

  addFoldingRangeHandler() {
    this.languages.registerFoldingRangeProvider([this.languageId], {
      provideFoldingRanges: this.bind(this.service.doProvideFoldingRanges),
    });
  }

  addRenameHandler() {
    this.languages.registerRenameProvider([this.languageId], {
      provideRenameEdits: this.bind(this.service.doProvideRenameEdits),
      resolveRenameLocation: this.bind(this.service.doResolveRenameLocation),
    });
  }

  cancelToken = Symbol.for("lspCancelToken");
  async wrapAsync<T>(loader: T, cancelToken: Lsp.CancellationToken): Promise<void | T> {
    let dispose: Lsp.Disposable;
    try {
      const result = await Promise.race([
        loader,
        new Promise<Symbol>((resolve) => {
          dispose = cancelToken.onCancellationRequested(() => resolve(this.cancelToken));
        }),
      ]);
      if (result === this.cancelToken || cancelToken.isCancellationRequested) return;
      return result as T;
    } catch (error) {
      dispose.dispose();
    }
  }

  bind<Param extends IRequestParams, T extends (params: Param) => any>(target: T) {
    return (async (params: IRequestParams, cancelToken: Lsp.CancellationToken) => {
      if (
        !TextDocumentIdentifier.is(params.textDocument) ||
        !this.attached.has(params.textDocument.uri)
      ) {
        console.debug("Stop Event", params);
        return;
      }
      try {
        const diagnosticsParams = await this.wrapAsync(this.DiagnosticsTick.wait(), cancelToken);
        if (diagnosticsParams) {
          const result = (await this.wrapAsync(
            target.call(this.service, params),
            cancelToken
          )) as any;
          return result;
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    }) as unknown as T extends (param: Param) => infer R
      ? (param: Param, token: Lsp.CancellationToken) => R
      : unknown;
  }
}
interface IRequestParams extends Lsp.WorkDoneProgressParams, Lsp.PartialResultParams {
  /**
   * The text document.
   */
  textDocument: Lsp.TextDocumentIdentifier;
}
