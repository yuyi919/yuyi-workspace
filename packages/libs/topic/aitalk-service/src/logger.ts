import { createLogger, Logger, LogLevel } from "@yuyi919/node-logger";

export const logger: Logger = createLogger("Ebyroid", {
  level: process.env.NODE_ENV !== "production" && LogLevel.Debug,
});
export { Logger };
