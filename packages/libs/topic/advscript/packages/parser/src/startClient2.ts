/* eslint-disable @typescript-eslint/no-this-alias */
import {
  LangiumDocument,
  LangiumServices,
  LanguageMetaData,
  OperationCancelled,
  startCancelableOperation,
  TextDocumentFactory,
} from "langium";
import {
  AbstractCancellationTokenSource,
  CancellationToken,
  Connection,
  HandlerResult,
  InitializeResult,
  RequestHandler,
  TextDocumentIdentifier,
  TextDocumentSyncKind,
} from "vscode-languageserver";
import { URI } from "vscode-uri";
import { monaco } from "./editor";
import {
  MonacoToProtocolConverter,
  ProtocolToMonacoConverter,
  TextDocument,
} from "./editor/languageclient";
import { appendChanged } from "./service/adapter";
import { createBrowerServices } from "./service/module";

function services2InitializeResult(services: LangiumServices, hasWorkspaceFolder?: boolean) {
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

const m2p = new MonacoToProtocolConverter(monaco);
const p2m = new ProtocolToMonacoConverter(monaco);
export function startClientService(MONACO_URI: monaco.Uri) {
  class DefaultTextDocumentFactory implements TextDocumentFactory {
    protected readonly languageMetaData: LanguageMetaData;
    protected readonly services: LangiumServices;

    constructor(services: LangiumServices) {
      this.languageMetaData = services.LanguageMetaData;
    }

    fromUri(uri: URI): TextDocument {
      const model = monaco.editor.getModel(uri);
      return TextDocument.create(
        uri.toString(),
        model.getLanguageId(),
        model.getVersionId(),
        model.getValue()
      );
    }
  }
  const services: LangiumServices = createBrowerServices({
    documents: {
      TextDocumentFactory: (injector) => new DefaultTextDocumentFactory(injector),
    },
  });
  const documents = services.documents.TextDocuments;
  const initializeResult = services2InitializeResult(services);
  console.log(documents, services, initializeResult);
  function getModel(): monaco.editor.IModel {
    return monaco.editor.getModel(MONACO_URI) as monaco.editor.IModel;
  }
  services.documents.TextDocuments;

  const model = getModel();

  const adapter = new Adapter(initializeResult, model);
  adapter.addDocumentsHandler(services);
  // adapter.addCompletionHandler(connection, services);
  adapter.addFindReferencesHandler(services);
  adapter.addDocumentSymbolHandler(services);
  adapter.addGotoDefinitionHandler(services);
  // adapter.addDocumentHighlightsHandler(connection, services);
  adapter.addFoldingRangeHandler(services);
  // adapter.addCodeActionHandler(connection, services);
  adapter.addRenameHandler(services);
  adapter.addHoverHandler(services);
}

class Adapter {
  constructor(
    private initializeResult: InitializeResult<any>,
    private model: monaco.editor.ITextModel,
    private languageId = model.getLanguageId(),
    private MONACO_URI: monaco.Uri = model.uri,
    private MONACO_URI_STRING = MONACO_URI.toString()
  ) {
    console.log(model, languageId);
    globalThis.setImmediate = (<TArgs extends any[]>(
      callback: (...args: TArgs) => void,
      ...args: TArgs
    ) => globalThis.setTimeout(callback, 5, ...args)) as any;
  }

  addDocumentsHandler(services: LangiumServices) {
    const { model, MONACO_URI, MONACO_URI_STRING } = this;
    let changeTokenSource: AbstractCancellationTokenSource;
    let changePromise: Promise<void> | undefined;

    this.model.onDidChangeContent((event) => {
      event.changes.forEach((changed) => {
        appendChanged(MONACO_URI_STRING, {
          range: m2p.asRange(changed.range),
          rangeLength: changed.rangeLength,
          text: changed.text,
        });
      });
      validate();
    });

    const pendingValidationRequests = new Map<string, number>();
    async function validate() {
      const document = createDocument(model);
      cleanPendingChange(document);
      changeTokenSource?.cancel();
      if (changePromise) {
        await changePromise;
      }
      changeTokenSource = startCancelableOperation();

      changePromise = new Promise<void>((resolve, reject) => {
        pendingValidationRequests.set(
          document.uri,
          setTimeout(async () => {
            pendingValidationRequests.delete(document.uri);
            const text = document.getText();
            // console.log(text, text.length);
            if (text.length === 0) {
              cleanDiagnostics();
              return;
            }
            const documentBuilder = services.documents.DocumentBuilder;
            try {
              await documentBuilder.update([MONACO_URI], [], changeTokenSource.token);
              resolve();
            } catch (err) {
              if (err !== OperationCancelled) {
                console.error("Error: ", err);
                reject(err);
              }
            }
          }, 200) as unknown as number
        );
      });
    }

    function cleanPendingChange(document: TextDocument): void {
      const request = pendingValidationRequests.get(document.uri);
      if (request !== undefined) {
        clearTimeout(request);
        pendingValidationRequests.delete(document.uri);
      }
    }

    function cleanDiagnostics(): void {
      monaco.editor.setModelMarkers(this.model, "default", []);
    }
    validate();
  }

  addCompletionHandler(connection: Connection, services: LangiumServices): void {
    const completionProvider = services.lsp.completion.CompletionProvider;
    connection.onCompletion(
      this.createHandler((document, params, cancelToken) => {
        return completionProvider.getCompletion(document, params, cancelToken);
      }, services)
    );
  }

  addFindReferencesHandler(services: LangiumServices): void {
    monaco.languages.registerReferenceProvider(this.languageId, {
      provideReferences: async (model, position, context, token) => {
        const document = this.getDocument(model, services);
        const result = await services.lsp.ReferenceFinder.findReferences(
          document,
          {
            textDocument: document.textDocument,
            position: m2p.asPosition(position.lineNumber, position.column),
            context,
          },
          token
        );
        return result.map((loc) => p2m.asLocation(loc));
      },
    });
    // const referenceFinder = services.lsp.ReferenceFinder;
    // connection.onReferences(
    //   this.createHandler(
    //     (document, params, cancelToken) =>
    //       referenceFinder.findReferences(document, params, cancelToken),
    //     services
    //   )
    // );
  }

  addCodeActionHandler(connection: Connection, services: LangiumServices): void {
    const codeActionProvider = services.lsp.CodeActionProvider;
    if (!codeActionProvider) {
      return;
    }
    connection.onCodeAction(
      this.createHandler(
        (document, params, cancelToken) =>
          codeActionProvider.getCodeActions(document, params, cancelToken),
        services
      )
    );
  }

  getDocument(model: monaco.editor.ITextModel, services: LangiumServices) {
    return services.documents.LangiumDocuments.getOrCreateDocument(model.uri);
  }

  addDocumentSymbolHandler(services: LangiumServices): void {
    monaco.languages.registerDocumentSymbolProvider(this.languageId, {
      async provideDocumentSymbols(model, token) {
        const document = services.documents.LangiumDocuments.getOrCreateDocument(model.uri);
        const symbols = await services.lsp.DocumentSymbolProvider.getSymbols(
          document,
          {
            textDocument: document.textDocument,
          },
          token
        );
        return p2m.asDocumentSymbols(symbols);
      },
    });
  }

  addGotoDefinitionHandler(services: LangiumServices): void {
    monaco.languages.registerDefinitionProvider(this.languageId, {
      provideDefinition,
    });
    async function provideDefinition(
      model: monaco.editor.ITextModel,
      position: monaco.Position,
      cancelToken: monaco.CancellationToken
    ) {
      const document = services.documents.LangiumDocuments.getOrCreateDocument(model.uri);
      const results = await services.lsp.GoToResolver.goToDefinition(
        document,
        {
          textDocument: document.textDocument,
          position: m2p.asPosition(position.lineNumber, position.column),
        },
        cancelToken
      );
      return p2m.asDefinitionResult(results);
    }

    monaco.languages.registerDeclarationProvider(this.languageId, {
      provideDeclaration: provideDefinition,
    });
  }

  addDocumentHighlightsHandler(connection: Connection, services: LangiumServices): void {
    const documentHighlighter = services.lsp.DocumentHighlighter;
    connection.onDocumentHighlight(
      this.createHandler(
        (document, params, cancelToken) =>
          documentHighlighter.findHighlights(document, params, cancelToken),
        services
      )
    );
  }

  addHoverHandler(services: LangiumServices): void {
    const hoverProvider = services.lsp.HoverProvider;
    monaco.languages.registerHoverProvider(this.languageId, {
      async provideHover(model, position, token) {
        const document = services.documents.LangiumDocuments.getOrCreateDocument(model.uri);
        // hoverProvider.getHoverContent(createDocument(model), params, cancelToken),
        const r = await hoverProvider.getHoverContent(
          document,
          {
            textDocument: document.textDocument,
            position: m2p.asPosition(position.lineNumber, position.column),
          },
          token
        );
        // console.log(
        //   r,
        //   p2m.asHover(r),
        //   getPositionOfLineAndCharacter(
        //     model.getValue().split("\n"),
        //     m2p.asPosition(position.lineNumber, position.column)
        //   )
        // );
        return p2m.asHover(r);
      },
    });
  }

  addFoldingRangeHandler(services: LangiumServices): void {
    monaco.languages.registerFoldingRangeProvider(this.languageId, {
      provideFoldingRanges: async (model, context, token) => {
        const document = this.getDocument(model, services);
        const result = await services.lsp.FoldingRangeProvider.getFoldingRanges(
          document,
          {
            textDocument: document.textDocument,
          },
          token
        );
        return p2m.asFoldingRanges(result);
      },
    });
  }

  addRenameHandler(services: LangiumServices): void {
    monaco.languages.registerRenameProvider(this.languageId, {
      provideRenameEdits: async (model, position, newName, token) => {
        const document = this.getDocument(model, services);
        const result = await services.lsp.RenameHandler.renameElement(
          document,
          {
            textDocument: document.textDocument,
            position: m2p.asPosition(position.lineNumber, position.column),
            newName: newName,
          },
          token
        );
        return p2m.asWorkspaceEdit(result);
      },
      resolveRenameLocation: async (model, position, token) => {
        const document = this.getDocument(model, services);
        const result = await services.lsp.RenameHandler.prepareRename(
          document,
          {
            textDocument: document.textDocument,
            position: m2p.asPosition(position.lineNumber, position.column),
          },
          token
        );
        console.log(position, result, document.precomputedScopes);
        return {
          range: p2m.asRange(result),
          text: "auto",
        };
      },
    });
  }

  createHandler<P extends { textDocument: TextDocumentIdentifier }, R, E = void>(
    serviceCall: (
      document: LangiumDocument,
      params: P,
      cancelToken: CancellationToken
    ) => HandlerResult<R, E>,
    services: LangiumServices
  ): RequestHandler<P, R | null, E> {
    return async (params: P, cancelToken: CancellationToken) => {
      const document = this.paramsDocument(params, services);
      if (!document) {
        return null;
      }
      try {
        return await serviceCall(document, params, cancelToken);
      } catch (err) {
        return this.responseError<E>(err);
      }
    };
  }
  responseError<E>(err: E) {
    // throw err;
    return null;
  }

  paramsDocument(
    params: { textDocument: TextDocumentIdentifier },
    services: LangiumServices
  ): LangiumDocument | undefined {
    const uri = URI.parse(params.textDocument.uri);
    return services.documents.LangiumDocuments.getOrCreateDocument(uri);
  }
}
function createDocument(model: monaco.editor.IReadOnlyModel) {
  return TextDocument.create(
    model.uri.toString(),
    model.getLanguageId(),
    model.getVersionId(),
    model.getValue()
  );
}
