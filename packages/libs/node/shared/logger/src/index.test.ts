import { createLogger, LogLevel, defineAppendMeta } from "./index";
describe("createLogger()", () => {
  it("use logger", () => {
    const logger = createLogger("Test", {
      level: process.env.NODE_ENV !== "production" && LogLevel.Debug,
    });
    logger.info("测试info");
    logger.debug("测试debug");
    logger.verbose("测试verbose");
    logger.error("测试error");
    logger.warn("测试warn");
    logger.hint("测试hint");
    logger.success("测试success");
  });  
  it("use logger context", () => {
    const logger = createLogger("Test", {
      level: process.env.NODE_ENV !== "production" && LogLevel.Debug,
      context: "Test Context"
    });
    logger.info("测试info", defineAppendMeta({ context: "动态context" }));
    logger.debug("测试debug");
    logger.verbose("测试verbose");
    logger.error("测试error");
    logger.warn("测试warn");
    logger.hint("测试hint");
    logger.success("测试success");
  });
});
