import type * as Lsp from "vscode-languageserver-protocol";
import { TextDocumentIdentifier } from "vscode-languageserver-protocol";
import { Monaco, MonacoEditorRegisterAdapter, TMonaco } from "./lib";
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
      console.log("Adapter init", this);
    }
  }

  addDocumentsHandler() {
    this.addDispose(
      this._monaco.editor.onDidCreateModel((model) => {
        const MONACO_URI: Monaco.Uri = model.uri;
        const MONACO_URI_STRING = MONACO_URI.toString();
        const { next } = this.DiagnosticsTick.createNext();
        this.service.doDocumentLoaded(MONACO_URI_STRING, model.getValue()).then((param) => {
          if (this.attached.has(MONACO_URI_STRING)) {
            this.updateModelMarkers(model, param);
          }
          next();
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
                    next();
                  }
                });
            }
          })
        );
      })
    );
  }
  DiagnosticsTick = new Waiter<void>();

  protected updateModelMarkers = (
    model: Monaco.editor.ITextModel,
    params: Lsp.PublishDiagnosticsParams
  ) => {
    console.log("updateModelMarkers", params);
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
      },
      ...(this.initializeResult.capabilities.completionProvider.triggerCharacters || [])
    );
    this.languages.registerInlineCompletionItemProvider([this.languageId], {
      provideCompletionItems: this.bind(this.service.doProvideCompletionItems),
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

  bind<T extends (params: any) => any, Args extends Parameters<T>>(target: T) {
    return (async (params, token) => {
      if (
        !TextDocumentIdentifier.is(params.textDocument) ||
        !this.attached.has(params.textDocument.uri)
      ) {
        console.debug("Stop Event", params);
        return;
      }

      try {
        await this.DiagnosticsTick.wait();
        const result = (await target.apply(this.service, [params])) as any;
        // console.log("bind", target.name, params, token, result);
        // if (result) {
        return result;
        // }
      } catch (error) {
        console.error(error);
        token.cancel?.();
        throw error;
      }
    }) as unknown as Args extends (model: Monaco.editor.ITextModel, ...args: infer P) => infer R
      ? (model: string, ...args: P) => R
      : never;
  }
}
