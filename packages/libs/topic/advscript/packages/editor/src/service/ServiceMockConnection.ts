/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  RemoteClient,
  RemoteConsole,
  RemoteTracer,
  ServerRequestHandler,
  Telemetry,
  _Connection,
  _Languages,
  _RemoteWindow,
  _RemoteWorkspace,
} from "vscode-languageserver";
import type {
  CancellationToken,
  CodeAction,
  CodeActionParams,
  CodeLens,
  CodeLensParams,
  ColorInformation,
  ColorPresentation,
  ColorPresentationParams,
  Command,
  CompletionItem,
  CompletionList,
  CompletionParams,
  Declaration,
  DeclarationParams,
  Definition,
  DefinitionParams,
  DidChangeConfigurationParams,
  DidChangeTextDocumentParams,
  DidChangeWatchedFilesParams,
  DidCloseTextDocumentParams,
  DidOpenTextDocumentParams,
  DidSaveTextDocumentParams,
  Disposable,
  DocumentColorParams,
  DocumentFormattingParams,
  DocumentHighlight,
  DocumentHighlightParams,
  DocumentLink,
  DocumentLinkParams,
  DocumentOnTypeFormattingParams,
  DocumentRangeFormattingParams,
  DocumentSymbol,
  DocumentSymbolParams,
  ExecuteCommandParams,
  FoldingRange,
  FoldingRangeParams,
  GenericNotificationHandler,
  GenericRequestHandler,
  Hover,
  HoverParams,
  ImplementationParams,
  InitializedParams,
  InitializeError,
  InitializeParams,
  InitializeResult,
  Location,
  LocationLink,
  NotificationHandler,
  NotificationHandler0,
  NotificationType,
  NotificationType0,
  PrepareRenameParams,
  ProgressType,
  ProtocolNotificationType,
  ProtocolNotificationType0,
  ProtocolRequestType,
  ProtocolRequestType0,
  PublishDiagnosticsParams,
  Range,
  ReferenceParams,
  RenameParams,
  RequestHandler,
  RequestHandler0,
  RequestType,
  RequestType0,
  SelectionRange,
  SelectionRangeParams,
  SignatureHelp,
  SignatureHelpParams,
  StarNotificationHandler,
  StarRequestHandler,
  SymbolInformation,
  TextEdit,
  TypeDefinitionParams,
  WillSaveTextDocumentParams,
  WorkspaceEdit,
  WorkspaceSymbolParams,
} from "vscode-languageserver-protocol";
import type { CallHierarchy } from "vscode-languageserver/lib/common/callHierarchy";
import type { Configuration } from "vscode-languageserver/lib/common/configuration";
import type { FileOperationsFeatureShape } from "vscode-languageserver/lib/common/fileOperations";
import type { LinkedEditingRangeFeatureShape } from "vscode-languageserver/lib/common/linkedEditingRange";
import type { MonikerFeatureShape } from "vscode-languageserver/lib/common/moniker";
import type { WindowProgress } from "vscode-languageserver/lib/common/progress";
import type { SemanticTokensFeatureShape } from "vscode-languageserver/lib/common/semanticTokens";
import type { ShowDocumentFeatureShape } from "vscode-languageserver/lib/common/showDocument";
import type { WorkspaceFolders } from "vscode-languageserver/lib/common/workspaceFolders";
import type { Monaco, TMonaco } from "../lib/monaco.export";

class ServiceMockConnection implements _Connection {
  protected _connection = {} as {
    [K in keyof _Connection]: _Connection[K] extends (handle: (...args: infer A) => any) => any
      ? Monaco.Emitter<A>
      : never;
  };
  protected _sendDiagnostics: monaco.Emitter<PublishDiagnosticsParams>;

  listen() {
    return this._connection;
  }

  onRequest<R, PR, E, RO>(
    type: ProtocolRequestType0<R, PR, E, RO>,
    handler: RequestHandler0<R, E>
  ): void;
  onRequest<P, R, PR, E, RO>(
    type: ProtocolRequestType<P, R, PR, E, RO>,
    handler: RequestHandler<P, R, E>
  ): void;
  onRequest<R, PR, E, RO>(type: RequestType0<R, E>, handler: RequestHandler0<R, E>): void;
  onRequest<P, R, E>(type: RequestType<P, R, E>, handler: RequestHandler<P, R, E>): void;
  onRequest<R, E>(method: string, handler: GenericRequestHandler<R, E>): void;
  onRequest(handler: StarRequestHandler): void;
  onRequest(method: any, handler?: any): void {
    throw new Error("Method not implemented.");
  }

  sendRequest<R, PR, E, RO>(
    type: ProtocolRequestType0<R, PR, E, RO>,
    token?: CancellationToken
  ): Promise<R>;
  sendRequest<P, R, PR, E, RO>(
    type: ProtocolRequestType<P, R, PR, E, RO>,
    params: P,
    token?: CancellationToken
  ): Promise<R>;
  sendRequest<R, E>(type: RequestType0<R, E>, token?: CancellationToken): Promise<R>;
  sendRequest<P, R, E>(
    type: RequestType<P, R, E>,
    params: P,
    token?: CancellationToken
  ): Promise<R>;
  sendRequest<R>(method: string, token?: CancellationToken): Promise<R>;
  sendRequest<R>(method: string, params: any, token?: CancellationToken): Promise<R>;
  sendRequest<R>(
    method: any,
    params?: any,
    token?: any
  ): Promise<R> | Promise<R> | Promise<R> | Promise<R> | Promise<R> | Promise<R> {
    throw new Error("Method not implemented.");
  }

  onNotification<RO>(type: ProtocolNotificationType0<RO>, handler: NotificationHandler0): void;
  onNotification<P, RO>(
    type: ProtocolNotificationType<P, RO>,
    handler: NotificationHandler<P>
  ): void;
  onNotification(type: NotificationType0, handler: NotificationHandler0): void;
  onNotification<P>(type: NotificationType<P>, handler: NotificationHandler<P>): void;
  onNotification(method: string, handler: GenericNotificationHandler): void;
  onNotification(handler: StarNotificationHandler): void;
  onNotification(method: any, handler?: any): void {
    throw new Error("Method not implemented.");
  }
  sendNotification<RO>(type: ProtocolNotificationType0<RO>): void;
  sendNotification<P, RO>(type: ProtocolNotificationType<P, RO>, params: P): void;
  sendNotification(type: NotificationType0): void;
  sendNotification<P>(type: NotificationType<P>, params: P): void;
  sendNotification(method: string, params?: any): void;
  sendNotification(method: any, params?: any): void {
    throw new Error("Method not implemented.");
  }

  onProgress<P>(
    type: ProgressType<P>,
    token: string | number,
    handler: NotificationHandler<P>
  ): Disposable {
    throw new Error("Method not implemented.");
  }
  sendProgress<P>(type: ProgressType<P>, token: string | number, value: P): void {
    throw new Error("Method not implemented.");
  }

  sendDiagnostics(params: PublishDiagnosticsParams): void {
    this._sendDiagnostics.fire(params);
  }

  onInitialize(
    handler: ServerRequestHandler<InitializeParams, InitializeResult<any>, never, InitializeError>
  ): void {
    throw new Error("Method not implemented.");
  }
  onInitialized(handler: NotificationHandler<InitializedParams>): void {
    throw new Error("Method not implemented.");
  }
  onShutdown(handler: RequestHandler0<void, void>): void {
    throw new Error("Method not implemented.");
  }
  onExit(handler: NotificationHandler0): void {
    throw new Error("Method not implemented.");
  }
  console: RemoteConsole;
  tracer: RemoteTracer;
  telemetry: Telemetry;
  client: RemoteClient;
  window: _RemoteWindow & WindowProgress & ShowDocumentFeatureShape;
  workspace: _RemoteWorkspace & Configuration & WorkspaceFolders & FileOperationsFeatureShape;
  languages: _Languages &
    CallHierarchy &
    SemanticTokensFeatureShape &
    LinkedEditingRangeFeatureShape &
    MonikerFeatureShape;
  onDidChangeConfiguration(handler: NotificationHandler<DidChangeConfigurationParams>): void {
    throw new Error("Method not implemented.");
  }
  onDidChangeWatchedFiles(handler: NotificationHandler<DidChangeWatchedFilesParams>): void {
    throw new Error("Method not implemented.");
  }
  onDidOpenTextDocument(handler: NotificationHandler<DidOpenTextDocumentParams>): void {
    this._connection.onDidOpenTextDocument.event(([e]) => {
      handler(e);
    });
  }
  onDidChangeTextDocument(handler: NotificationHandler<DidChangeTextDocumentParams>): void {
    throw new Error("Method not implemented.");
  }
  onDidCloseTextDocument(handler: NotificationHandler<DidCloseTextDocumentParams>): void {
    throw new Error("Method not implemented.");
  }
  onWillSaveTextDocument(handler: NotificationHandler<WillSaveTextDocumentParams>): void {
    throw new Error("Method not implemented.");
  }
  onWillSaveTextDocumentWaitUntil(
    handler: RequestHandler<WillSaveTextDocumentParams, TextEdit[], void>
  ): void {
    throw new Error("Method not implemented.");
  }
  onDidSaveTextDocument(handler: NotificationHandler<DidSaveTextDocumentParams>): void {
    throw new Error("Method not implemented.");
  }
  onHover(handler: ServerRequestHandler<HoverParams, Hover, never, void>): void {
    throw new Error("Method not implemented.");
  }
  onCompletion(
    handler: ServerRequestHandler<
      CompletionParams,
      CompletionList | CompletionItem[],
      CompletionItem[],
      void
    >
  ): void {
    throw new Error("Method not implemented.");
  }
  onCompletionResolve(handler: RequestHandler<CompletionItem, CompletionItem, void>): void {
    throw new Error("Method not implemented.");
  }
  onSignatureHelp(
    handler: ServerRequestHandler<SignatureHelpParams, SignatureHelp, never, void>
  ): void {
    throw new Error("Method not implemented.");
  }
  onDeclaration(
    handler: ServerRequestHandler<
      DeclarationParams,
      Declaration | LocationLink[],
      Location[] | LocationLink[],
      void
    >
  ): void {
    throw new Error("Method not implemented.");
  }
  onDefinition(
    handler: ServerRequestHandler<
      DefinitionParams,
      Definition | LocationLink[],
      Location[] | LocationLink[],
      void
    >
  ): void {
    throw new Error("Method not implemented.");
  }
  onTypeDefinition(
    handler: ServerRequestHandler<
      TypeDefinitionParams,
      Definition | LocationLink[],
      Location[] | LocationLink[],
      void
    >
  ): void {
    throw new Error("Method not implemented.");
  }
  onImplementation(
    handler: ServerRequestHandler<
      ImplementationParams,
      Definition | LocationLink[],
      Location[] | LocationLink[],
      void
    >
  ): void {
    throw new Error("Method not implemented.");
  }
  onReferences(handler: ServerRequestHandler<ReferenceParams, Location[], Location[], void>): void {
    throw new Error("Method not implemented.");
  }
  onDocumentHighlight(
    handler: ServerRequestHandler<
      DocumentHighlightParams,
      DocumentHighlight[],
      DocumentHighlight[],
      void
    >
  ): void {
    throw new Error("Method not implemented.");
  }
  onDocumentSymbol(
    handler: ServerRequestHandler<
      DocumentSymbolParams,
      SymbolInformation[] | DocumentSymbol[],
      SymbolInformation[] | DocumentSymbol[],
      void
    >
  ): void {
    throw new Error("Method not implemented.");
  }
  onWorkspaceSymbol(
    handler: ServerRequestHandler<
      WorkspaceSymbolParams,
      SymbolInformation[],
      SymbolInformation[],
      void
    >
  ): void {
    throw new Error("Method not implemented.");
  }
  onCodeAction(
    handler: ServerRequestHandler<
      CodeActionParams,
      (Command | CodeAction)[],
      (Command | CodeAction)[],
      void
    >
  ): void {
    throw new Error("Method not implemented.");
  }
  onCodeActionResolve(handler: RequestHandler<CodeAction, CodeAction, void>): void {
    throw new Error("Method not implemented.");
  }
  onCodeLens(handler: ServerRequestHandler<CodeLensParams, CodeLens[], CodeLens[], void>): void {
    throw new Error("Method not implemented.");
  }
  onCodeLensResolve(handler: RequestHandler<CodeLens, CodeLens, void>): void {
    throw new Error("Method not implemented.");
  }
  onDocumentFormatting(
    handler: ServerRequestHandler<DocumentFormattingParams, TextEdit[], never, void>
  ): void {
    throw new Error("Method not implemented.");
  }
  onDocumentRangeFormatting(
    handler: ServerRequestHandler<DocumentRangeFormattingParams, TextEdit[], never, void>
  ): void {
    throw new Error("Method not implemented.");
  }
  onDocumentOnTypeFormatting(
    handler: RequestHandler<DocumentOnTypeFormattingParams, TextEdit[], void>
  ): void {
    throw new Error("Method not implemented.");
  }
  onRenameRequest(handler: ServerRequestHandler<RenameParams, WorkspaceEdit, never, void>): void {
    throw new Error("Method not implemented.");
  }
  onPrepareRename(
    handler: RequestHandler<
      PrepareRenameParams,
      Range | { range: Range; placeholder: string },
      void
    >
  ): void {
    throw new Error("Method not implemented.");
  }
  onDocumentLinks(
    handler: ServerRequestHandler<DocumentLinkParams, DocumentLink[], DocumentLink[], void>
  ): void {
    throw new Error("Method not implemented.");
  }
  onDocumentLinkResolve(handler: RequestHandler<DocumentLink, DocumentLink, void>): void {
    throw new Error("Method not implemented.");
  }
  onDocumentColor(
    handler: ServerRequestHandler<DocumentColorParams, ColorInformation[], ColorInformation[], void>
  ): void {
    throw new Error("Method not implemented.");
  }
  onColorPresentation(
    handler: ServerRequestHandler<
      ColorPresentationParams,
      ColorPresentation[],
      ColorPresentation[],
      void
    >
  ): void {
    throw new Error("Method not implemented.");
  }
  onFoldingRanges(
    handler: ServerRequestHandler<FoldingRangeParams, FoldingRange[], FoldingRange[], void>
  ): void {
    throw new Error("Method not implemented.");
  }
  onSelectionRanges(
    handler: ServerRequestHandler<SelectionRangeParams, SelectionRange[], SelectionRange[], void>
  ): void {
    throw new Error("Method not implemented.");
  }
  onExecuteCommand(handler: ServerRequestHandler<ExecuteCommandParams, any, never, void>): void {
    throw new Error("Method not implemented.");
  }
  dispose(): void {
    throw new Error("Method not implemented.");
  }
}
export class ServiceMockConnectionWrapper extends ServiceMockConnection {
  static create(_monaco: TMonaco) {
    const connection = new ServiceMockConnectionWrapper();
    connection._sendDiagnostics = new _monaco.Emitter();
    return new Proxy<ServiceMockConnectionWrapper>(connection, {
      get: (
        target: ServiceMockConnectionWrapper,
        p: keyof ServiceMockConnectionWrapper,
        receiver: ServiceMockConnection
      ) => {
        if (p === "sendDiagnostics") {
          return target[p].bind(receiver);
        }
        if (!(target[p] instanceof Function)) {
          return target[p];
        }
        ServiceMockConnectionWrapper.register(target, p, _monaco);
        return (handle: any) => {
          try {
            if (target[p] instanceof Function)
              return Reflect.apply(target[p] as Function, receiver, [handle]);
          } catch (error) {
            if (error.message === "Method not implemented.") {
              // console.debug("proxy", p, error.message);
              target._connection[p].event((args) => {
                // console.debug(p, args, handle);
                handle(...args);
              });
              return;
            }
            throw error;
          }
        };
      },
    });
  }

  static register(target: ServiceMockConnectionWrapper, p: string, _monaco: typeof Monaco) {
    if (!target._connection[p]) {
      target._connection[p] = new _monaco.Emitter<any>();
    }
  }

  static didChangeTextDocument(
    connection: ServiceMockConnectionWrapper,
    params: DidChangeTextDocumentParams
  ) {
    connection._connection.onDidChangeTextDocument.fire([params]);
  }

  static didOpenTextDocument(
    connection: ServiceMockConnectionWrapper,
    params: DidOpenTextDocumentParams
  ) {
    connection._connection.onDidOpenTextDocument.fire([params]);
  }

  static onDidDiagnostics(
    connection: ServiceMockConnection,
    handler: NotificationHandler<PublishDiagnosticsParams>
  ) {
    return (connection as ServiceMockConnectionWrapper)._sendDiagnostics.event((param) => {
      return handler(param);
    });
  }
}
