import { monaco } from "./editor";
import { listen } from "@codingame/monaco-jsonrpc";
import {
  MessageConnection,
  MonacoLanguageClient,
  MonacoServices,
  createConnection,
  CloseAction,
  ErrorAction,
} from "./editor/languageclient";
import ReconnectingWebSocket from "reconnecting-websocket";

function startClient() {
  function createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
    return new MonacoLanguageClient({
      name: "Sample Language Client",
      clientOptions: {
        // use a language id as a document selector
        documentSelector: ["advscript"],
        // disable the default error handler
        errorHandler: {
          error: () => ErrorAction.Continue,
          closed: () => CloseAction.DoNotRestart,
        },
      },
      // create a language client connection from the JSON RPC connection on demand
      connectionProvider: {
        get: (errorHandler, closeHandler) => {
          return Promise.resolve(createConnection(connection, errorHandler, closeHandler));
        },
      },
    });
  }
  function createUrl(path: string): string {
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    return `${protocol}://${location.host}${location.pathname}${path}`;
  }

  function createWebSocket(url: string): WebSocket {
    return new ReconnectingWebSocket(
      url,
      [],
      Object.create({
        maxReconnectionDelay: 10000,
        minReconnectionDelay: 1000,
        reconnectionDelayGrowFactor: 1.3,
        connectionTimeout: 10000,
        maxRetries: Infinity,
        debug: false,
      })
    );
  }

  // install Monaco language client services
  MonacoServices.install(monaco);
  const url = createUrl("/sampleServer");
  const webSocket = createWebSocket(url);
  // listen when the web socket is opened
  listen({
    webSocket,
    onConnection: (connection) => {
      // create and start the language client
      const languageClient = createLanguageClient(connection);
      const disposable = languageClient.start();
      connection.onClose(() => disposable.dispose());
    },
  });
}
