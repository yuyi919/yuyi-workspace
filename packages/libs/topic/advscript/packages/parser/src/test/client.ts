import { createTAPReporter, hold, report } from "zora";
import { IMessage, IReporterMessage, map } from "./util";

hold();

const passThroughReporter = map((message) => message);

const createSocketReporter = (_opts: any = {}) =>
  new Promise<(stream: IReporterMessage) => Promise<void>>((resolve, reject) => {
    const socket = new WebSocket("ws://localhost:45454");
    // Connection opened
    socket.addEventListener("open", () => {
      open();
    });
    function open() {
      resolve(async (stream: IReporterMessage) => {
        sendObj({ type: "RUN_START" });
        for await (const message of stream) {
          sendObj(message);
        }
        sendObj({ type: "RUN_END" });
      });
    }
    async function sendObj(obj) {
      return socket.send(JSON.stringify(obj));
    }

    socket.addEventListener("error", (err) => {
      console.error(err);
      reject(err);
    });
  });

const reporter = createTAPReporter({
  log(message) {
    message && console.info(`%c[Zora]%c ${message}`, "color: #00bbee; font-weight: bold;", "");
  },
  serialize(data) {
    return typeof data === "string"
      ? data
      : data instanceof RegExp
      ? `/${data.source}/`
      : JSON.stringify(data);
  },
});

async function* message(stream: AsyncGenerator<IMessage>) {
  for await (const message of stream) {
    if (message.type === "ASSERTION") {
      yield message;
      // console.log(message, getAssertionLocation())
    } else {
      if (message.type === "TEST_START" && !message.data.skip) {
        console.groupCollapsed(
          `%c[Zora]%c ${message.data.description} - START`,
          "color: #00bbee;",
          ""
        );
      } else if (message.type === "TEST_END") {
        console.groupEnd();
        console.info(
          `%c[Zora]%c ${message.data.description} - End - (${message.data.executionTime}ms)`,
          "color: #00bbee; font-weight: bold;",
          ""
        );
      }
    }
  }
}

const devToolReporter = (stream: AsyncGenerator<IMessage>) => {
  return reporter(message(stream));
};

function runner() {
  Promise.all(Object.values(import.meta.glob("../**/*.zora.ts")).map((spec) => spec()))
    .then(
      () =>
        report({
          reporter: passThroughReporter,
        }) as unknown as Promise<AsyncIterator<IMessage>>
    )
    .then(async (messageStream) => {
      if (messageStream) {
        const [st1, st2] = tee(messageStream);
        const socketReporter = await createSocketReporter();
        socketReporter(st2);
        return devToolReporter(st1);
      }
    });
}

function iteratorToStream<T>(iterator: AsyncIterator<T>) {
  return new ReadableStream<T>({
    async pull(controller) {
      // console.log(iterator);
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

async function* streamAsyncIterator<T>(stream: ReadableStream<T>) {
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

function tee<T>(iterator: AsyncIterator<T>) {
  return iteratorToStream(iterator).tee().map(streamAsyncIterator) as [
    AsyncGenerator<T>,
    AsyncGenerator<T>
  ];
}

// runner()
