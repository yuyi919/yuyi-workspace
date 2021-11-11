import { pathToFileURL } from "url";
import { ViteDevServer } from "vite";
import WebSocket from "ws";
import { createDiffReporter } from "zora-reporters";
import { compose, map } from "./util";

const webSocketPort = parseFloat(process.env.WS_SERVER_PORT) || 45454;

const locateOnFS = map((message) => {
  if (message.type === "ASSERTION") {
    if (message.data.pass !== false) {
      return message;
    }
    const { at, ...restOfData } = message.data;
    const { pathname } = new URL(at);
    const onFS = new URL(pathname, pathToFileURL(process.cwd()));
    return {
      ...message,
      data: {
        ...restOfData,
        at: onFS,
      },
    };
  }

  return message;
});

export default async (server: ViteDevServer) => {
  const reporter = compose([createDiffReporter(), locateOnFS]);
  const webSocketServer = new WebSocket.WebSocketServer({
    port: webSocketPort
  });
  let connected = false;
  webSocketServer.on("connection", (ws) => {
    !connected && console.debug("client connected"), (connected = true);
    reporter(streamRunFromSocket(ws));
  });

  webSocketServer.on("close", function close() {
    console.debug("client disconnected");
  });

  return webSocketServer
};

async function* streamRunFromSocket(socket) {
  const buffer = [];
  let done = false;
  let release;
  try {
    socket.on("message", listener);

    while (true) {
      if (done) {
        break;
      }
      const message = buffer.shift();
      if (message) {
        yield message;
      } else {
        await new Promise((resolve) => (release = resolve));
      }
    }
  } finally {
    socket.off("message", listener);
  }

  function listener(message) {
    const messageObj = JSON.parse(message);

    if (messageObj.type === "RUN_END") {
      done = true;
    }

    buffer.push(messageObj);
    release?.();
  }
}
