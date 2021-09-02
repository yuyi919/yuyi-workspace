/* eslint-disable @typescript-eslint/no-explicit-any */
import * as winston from "winston";
import type {
  Logger as WLogger,
  LoggerOptions as winLoggerOptions,
  LeveledLogMethod,
} from "winston";
import { LogLevel, logLevels } from "./format";
import * as winstonDevConsole from "./formats";
import { DevConsoleFormatOptions } from "./formats/types";
import { join } from "path";

function normalizeOptions(config?: LoggerOptions) {
  const { level, showTrack = false, basePath, outputDir, ...other } = config || {};
  const loggerLevel = typeof logLevels[level] === "number" ? level : LogLevel.Info;
  return {
    level: loggerLevel,
    showTrack,
    basePath: basePath || process.cwd(),
    outputDir: typeof outputDir === "string" ? outputDir || "logs" : outputDir === true && "logs",
    ...other,
  };
}

export const winstonOptions = (name: string, config?: LoggerOptions) => {
  const options = normalizeOptions(config);
  const { level, showTrack, outputDir, basePath, ...other } = options;
  const format = winstonDevConsole.format(name, {
    showTrack,
    addLineSeparation: false,
    showTimestamps: false,
    basePath,
    ...other,
  });
  return {
    options,
    winstonOption: {
      levels: logLevels,
      transports: [
        new winston.transports.Console({
          format,
          level,
        }),
        outputDir &&
          new winston.transports.File({
            format,
            filename: join(basePath, outputDir, `${name}.log`),
            level,
          }),
        outputDir &&
          new winston.transports.File({
            format: winstonDevConsole.format(name, {
              basePath,
              ...other,
              showTrack: true,
              addLineSeparation: true,
              showTimestamps: true,
              color: false,
            }),
            filename: join(basePath, outputDir, `${name}-debug.log`),
            level: LogLevel.Debug,
          }),
      ].filter(Boolean),
    } as winLoggerOptions,
  };
};

export interface LoggerOptions extends DevConsoleFormatOptions {
  level?: LogLevel;
  debug?: boolean;
  outputDir?: string | boolean;
  parameters?: (...args: any[]) => any[];
  processStrackPath?: (stack: string) => string;
  trackDeep?: number;
}

export type LogLevelNames = keyof typeof logLevels;
export interface Logger extends WLogger, Record<LogLevelNames, LeveledLogMethod> {}

export const DEFAULT_LOGGER_NAME = "Main";
export function createLogger(name?: string, config?: LoggerOptions) {
  name = name || DEFAULT_LOGGER_NAME;
  const { options, winstonOption } = winstonOptions(name, config);
  const logger = winstonDevConsole.init(winston.createLogger(winstonOption), options) as Logger;
  if (options.debug) {
    logger.debug("Setup Logger", options);
  }
  return Object.assign(logger, {
    options,
    winstonOption,
  });
}

export { LogLevel, logLevels };
export * from "./formats";
