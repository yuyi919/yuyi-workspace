import { InitializeResult } from "vscode-languageserver-protocol";
import { Monaco, MonacoEditorRegisterAdapter, TMonaco } from "./lib";
import type { AdvScriptService } from "./service";

export class MonacoServiceWrapper extends MonacoEditorRegisterAdapter {
  private initializeResult: InitializeResult<any>;
  constructor(
    public _monaco: TMonaco,
    public service: AdvScriptService,
    private languageId: string
  ) {
    super(_monaco);
  }

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
        this.service.doDocumentLoaded(model.uri.toString(), model.getValue());
        const MONACO_URI: Monaco.Uri = model.uri;
        const MONACO_URI_STRING = MONACO_URI.toString();
        this.addDispose(
          model.onDidChangeContent((event) => {
            this.service.doDidChangeContent(MONACO_URI_STRING, model.getValue(), event.changes);
          })
        );
      })
    );
  }

  addCompletionHandler() {
    this.languages.registerCompletionItemProvider([this.languageId], {
      ...this.initializeResult.capabilities.completionProvider,
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
  }
  addGotoDefinitionHandler() {
    this.languages.registerDefinitionProvider([this.languageId], {
      provideDefinition: this.bind(this.service.doProvideDefinition),
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
      try {
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
