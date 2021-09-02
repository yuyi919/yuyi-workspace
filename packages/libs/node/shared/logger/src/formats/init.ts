/* eslint-disable prefer-spread */
/* eslint-disable @typescript-eslint/no-explicit-any */
import colors from "colors";
import type { LogCallback, Logger } from "winston";
import type { LoggerOptions } from "..";
import { calleeStore } from "./calleeStore";
import { DevConsoleFormatOptions } from "./types";
import { logLevels } from "../format";
import { SelfFormat } from "./format";

type LogLevel =
  | "error"
  | "warn"
  | "help"
  | "data"
  | "info"
  | "debug"
  | "prompt"
  | "http"
  | "verbose"
  | "input"
  | "silly";
const META_KEY = Symbol("META");
const APPEND_META_KEY = Symbol("APPEND_META");
export const getMeta = (target: any) => target?.[META_KEY];

export const addAppendMeta = <T extends Record<string, any>>(target: any, meta: T): any => {
  const source = findAppendMeta(target);
  Object.assign(source, meta);
  return target;
};
export const defineAppendMeta = <T extends Record<string, any>>(meta: T): any => {
  return { [APPEND_META_KEY]: meta };
};
export const findAppendMeta = (target: any): any => {
  return target[APPEND_META_KEY] || (target[APPEND_META_KEY] = {});
};
export const hasAppendMeta = (target: any): any => {
  return target && APPEND_META_KEY in target;
};
function createPatchedLogger(
  logger: Logger,
  level: LogLevel,
  showTrack: boolean,
  parameters?: (...args: any[]) => any[],
  processStrackPath?: (stack: string) => string,
  trackDeepOffset?: number
) {
  const handle = logger[level];
  const trackDeep =
    2 + (isFinite(trackDeepOffset) && !isNaN(trackDeepOffset) ? trackDeepOffset : 0);
  function logMethod(message: string, callback: LogCallback): Logger;
  function logMethod(message: string, meta: any, callback: LogCallback): Logger;
  function logMethod(message: string, ...meta: any[]): Logger;
  function logMethod(message: any): Logger;
  function logMethod(infoObject: Record<string, unknown>): Logger;

  function logMethod(this: Logger, ...args: any[]): Logger {
    if (parameters) args = parameters(...args);
    let message = "";
    const meta: any[] = [];
    let metaIndex = -1;
    let metaObject: any;
    for (let i = 0; i < args.length; i++) {
      const o = args[i];
      const argType = typeof o;
      if (i === 0 && argType === "string") {
        message = o;
      } else if (argType === "object" && hasAppendMeta(o)) {
        metaObject = findAppendMeta(o);
      } else {
        meta[++metaIndex] = o;
      }
    }
    let recordedMetaIndex = 0;
    if (!metaObject) metaObject = {};
    if (message) {
      message = message.replace(/%([a-zA-Z])/g, (_, type) => {
        let __return: string;
        ({ __return, recordedMetaIndex } = markParam(type, meta, recordedMetaIndex));
        return colors.brightBlue(__return);
      });
    }
    if (showTrack === true || level === "error" || getShowTrack(this)) {
      try {
        throw new Error();
      } catch (e) {
        const line =
          (e.stack as string)
            .split("\n")
            .find(
              (line, index) => index >= trackDeep && !line.trim().startsWith("at Logger.error")
            ) || "";
        const functionNameMatch = line.match(/\w+@|at (([^(]+)) \(.*/);
        const functionName = (functionNameMatch && functionNameMatch[1]) || "";
        const filePoint = line.replace(/\)(.*)$/, "").replace(/^(.*?)\(/, "");
        const [, filePath = filePoint, lineNumber, lineColNum] =
          /^(.+):([0-9]+):([0-9]+)$/.exec(filePoint) || [];
        calleeStore.value = {
          functionName,
          lineNumber,
          filePath: processStrackPath ? processStrackPath(filePath) : filePath,
          lineColNum,
        };
      }
    }
    const applyMeta = metaObject
      ? {
          ...metaObject,
          processStrackPath,
          [META_KEY]: meta,
        }
      : {
          processStrackPath,
          [META_KEY]: meta,
        };
    // console.log(message, applyMeta);
    const result = handle.apply(logger, [message, applyMeta]);
    calleeStore.value = void 0;
    // console.log("logMethod", level, message);
    return result;
  }
  logger[level] = logMethod;
}

function markParam(type: string, meta: any[], recordedMetaIndex: number) {
  switch (type) {
    case "s": {
      const top = meta.shift();
      return { __return: top?.toString(), recordedMetaIndex };
    }
    case "d": {
      return { __return: parseInt(meta.shift()) + "", recordedMetaIndex };
    }
    case "f": {
      return { __return: parseFloat(meta.shift()) + "", recordedMetaIndex };
    }
    case "o": {
      return { __return: `[Object:${recordedMetaIndex++}]`, recordedMetaIndex };
    }
    case "O": {
      return { __return: `[Object:${recordedMetaIndex++}]`, recordedMetaIndex };
    }
  }
  return { __return: type, recordedMetaIndex };
}

function getShowTrack(logger: Logger): boolean {
  return logger.transports.some(
    (o) => ((o.format as SelfFormat)?.opts as DevConsoleFormatOptions)?.showTrack
  );
}

export function init(logger: Logger, options: LoggerOptions): Logger {
  const { showTrack, parameters, processStrackPath, trackDeep } = options || {};
  for (const key in logLevels) {
    createPatchedLogger(
      logger,
      key as LogLevel,
      showTrack,
      parameters,
      processStrackPath,
      trackDeep
    );
  }
  return logger;
}
