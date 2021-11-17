import * as rpc from "@codingame/monaco-jsonrpc";
import * as http from "http";
import * as net from "net";
import * as url from "url";
import { Plugin } from "vite";
import * as ws from "ws";
import { launch } from "./src/server";

export function VitePluginLanguageServer(): Plugin {
  return {
    name: "vite-plugin-languageserver",
    configureServer(server) {
      const wss = new ws.Server({
        noServer: true,
        perMessageDeflate: false,
      });
      server.httpServer.on(
        "upgrade",
        (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
          const pathname = request.url ? url.parse(request.url).pathname : undefined;
          if (pathname.endsWith("/sampleServer")) {
            wss.handleUpgrade(request, socket, head, (webSocket) => {
              const socket: rpc.IWebSocket = {
                send: (content) =>
                  webSocket.send(content, (error) => {
                    if (error) {
                      throw error;
                    }
                  }),
                onMessage: (cb) => webSocket.on("message", cb),
                onError: (cb) => webSocket.on("error", cb),
                onClose: (cb) => webSocket.on("close", cb),
                dispose: () => webSocket.close(),
              };
              // launch the server when the web socket is opened
              if (webSocket.readyState === webSocket.OPEN) {
                launch(socket);
              } else {
                webSocket.on("open", () => launch(socket));
              }
            });
          }
        }
      );
      // launch({
      //   send(content) {
      //     console.log("send", content);
      //   },
      //   onClose(cb) {
      //     console.log("onClose", cb);
      //   },
      //   onError(cb) {
      //     console.log("onError", cb);
      //   },
      //   onMessage(cb) {
      //     console.log("onMessage", cb);
      //   },
      //   dispose() {
      //     console.log("dispose");
      //   },
      // });
    },
  };
}
