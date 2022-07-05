const { generateMarkdown } = require("ts-document");

console.log(generateMarkdown("./src/logger.ts"));

const { createLogger } = require(".");
const logger = createLogger("Foo", { timestamp: true });
logger.groupCollapsed("bar:%o", { foo: "bar" });
logger.banner("bar!");
logger.log("bar!");
logger.info("bar!");
logger.warn("bar!");
logger.begin("bar!");
logger.end("bar!");
logger.error("bar!");
logger.success("bar!");
logger.debug("bar!");
logger.trace("bar!");
logger.groupEnd()();
logger.properties({
  mode: "production",
  code: -0
})("dir");
logger.properties([
  {
    mode: "production",
    code: 1
  },
  {
    mode: "development",
    code: 2
  }
])("dir");
logger.properties(
  new Map([
    [
      {
        key: "object"
      },
      {
        value: "any"
      }
    ],
    [
      {
        key: "object"
      },
      {
        value: "any"
      }
    ],
    [
      {
        key: "object"
      },
      {
        value: "any"
      }
    ],
    [
      {
        key: "object"
      },
      {
        value: "any"
      }
    ],
    [
      {
        key: "object"
      },
      {
        value: "any"
      }
    ],
    [
      {
        key: "object"
      },
      {
        value: "any"
      }
    ],
    [
      {
        key: "object"
      },
      {
        value: "any"
      }
    ],
    [
      {
        key: "object"
      },
      {
        value: "any"
      }
    ],
    [
      {
        key: "object"
      },
      {
        value: "any"
      }
    ],
    [
      {
        key: "object"
      },
      {
        value: "any"
      }
    ],
    [
      {
        key: "object"
      },
      {
        value: "any"
      }
    ]
  ]),
  { index: true }
)("map");
