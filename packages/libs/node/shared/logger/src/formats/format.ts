/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-control-regex */
import colors from "colors";
import type { Color } from "colors";
import type { Format, TransformableInfo } from "logform";
import path from "path";
import triple from "triple-beam";
import { inspect } from "util";
import * as winston from "winston";
import { LogLevel, logLevels } from "../format";
import { calleeStore } from "./calleeStore";
import { getMeta } from "./init";
import { Callee, DevConsoleFormatOptions } from "./types";
declare module "logform" {
  export interface TransformableInfo {
    processStrackPath?: (path: string) => string;
    context?: string;
    stack?: string;
  }
}
declare module "colors" {
  interface Color {
    brightMagenta: Color;
    brightCyan: Color;
  }
  export const brightCyan: Color;
  export const brightMagenta: Color;
  export const brightYellow: Color;
  export const brightBlack: Color;
  export const brightBlue: Color;
  export const brightRed: Color;
}

export const nestLikeColors = {
  [LogLevel.Hint]: colors.brightCyan,
  [LogLevel.Info]: (str: string) => str,
  [LogLevel.Success]: colors.green,
  [LogLevel.Failed]: colors.brightRed,
  [LogLevel.Warn]: colors.yellow,
  [LogLevel.Warning]: colors.yellow,
  [LogLevel.Error]: colors.red,
  [LogLevel.Verbose]: colors.brightBlue,
  [LogLevel.Debug]: colors.grey,
};

export class DevConsoleFormat {
  private static readonly reSpaces = /^\s+/;
  private static readonly reSpacesOrEmpty = /^(\s*)/;
  private static readonly reColor = /\x1B\[\d+m/;

  private static readonly chars = {
    singleLine: "▪",
    startLine: "┏",
    line: "┃",
    endLine: "┗",
  };

  public constructor(public name: string, private opts: DevConsoleFormatOptions = {}) {
    if (typeof this.opts.addLineSeparation === "undefined") {
      this.opts.addLineSeparation = true;
    }
    if (typeof this.opts.showTimestamps === "undefined") {
      this.opts.showTimestamps = false;
    }
    if (typeof this.opts.inspectOptions === "undefined") {
      this.opts.inspectOptions = {
        depth: Infinity,
        colors: true,
        maxArrayLength: Infinity,
        breakLength: 120,
        compact: Infinity,
      };
    }
  }

  private inspector(value: any, metaLines: string[], noColor = false): void {
    const options = this.opts.inspectOptions ? { ...this.opts.inspectOptions } : {};
    if (noColor === true) {
      options.colors = false;
    }
    const inspector = typeof value === "string" ? value : inspect(value, options);
    // if (value != null && typeof value === 'object') {
    // console.log(inspector.replace(/([a-z]+)\{/, "{"))
    // inspector = dump(JSON.parse(inspector.replace(/([a-z]+)\{/, "{")), {
    // quotingType: '"'
    // })
    // }
    inspector.split("\n").forEach((line) => {
      metaLines.push(line);
    });
  }
  private upperFirst(level: string) {
    const [, color, keyword] = /^(\x1B\[\d+m)([a-zA-Z]+)/i.exec(level) || [];
    const at = keyword && level.indexOf(keyword);
    if (at) return color + keyword.charAt(0).toUpperCase() + level.slice(at + 1);
    return level;
  }

  private getPadding(message?: string): string {
    // const [, , keyword] = /^(\x1B\[\d+m)([a-zA-Z]+)/i.exec(level) || [];
    // return (" ").repeat(this.opts.context.length + 2 + 1 + keyword.length);
    let padding = "";
    const matches = message && message.match(DevConsoleFormat.reSpaces);
    if (matches && matches.length > 0) {
      padding = matches[0];
    }
    return padding;
  }

  private getMs(info: TransformableInfo): string {
    let ms = "";
    if (info.ms) {
      ms = colors.italic(colors.dim(` ${info.ms}`));
    }
    return ms;
  }
  static getTimestamp(timestamp: number) {
    const date = new Date(timestamp);
    return date.toISOString().replace(/T.+$/, " ") + date.toTimeString().replace(/ .+$/, "");
  }
  private getTimestamp(info: TransformableInfo): string {
    let timestamp = "";
    if (info.timestamp) {
      timestamp = DevConsoleFormat.getTimestamp(info.timestamp);
    }
    return colors.italic.brightMagenta.dim(timestamp);
  }

  private getStackLines(info: TransformableInfo): string[] {
    const stackLines: string[] = [];

    if (info.stack) {
      const error = new Error();
      error.stack = info.stack;
      this.inspector(error, stackLines, true);
      if (info.processStrackPath) {
        stackLines.forEach((line, index) => {
          stackLines[index] = line.replace(/\((.+)\)$/, (str, substr) => {
            return `(${info.processStrackPath(substr)})`;
          });
        });
      }
    }

    return stackLines;
  }

  private getMetaLines(info: TransformableInfo) {
    const plainItems: string[] = [];
    const metaLines: string[] = [];
    const lines = getMeta(info); //[SPLAT as unknown as string];
    if (lines?.length) {
      for (const line of lines) {
        if (line instanceof Array) {
          const splat = this.opts.immediate ? [...line] : line;
          this.inspector(splat, metaLines);
        } else if (line instanceof Object) {
          const splat = this.opts.immediate ? { ...line } : line;
          this.inspector(splat, metaLines);
        } else {
          this.inspector(line, metaLines);
          // plainItems.push(line as string);
        }
      }
    }
    return {
      plainItems,
      metaLines,
    };
  }

  private getCallee(): Callee | undefined {
    const callee = calleeStore?.value;

    if (callee?.filePath) {
      if (!this.opts.basePath) {
        // By default remove anything before and including `src/`
        callee.filePath = callee.filePath.replace(/^.*\/src\//, "");
      } else {
        callee.filePath = path.relative(this.opts.basePath, callee.filePath);
      }
    }

    return callee;
  }

  private getColor(info: TransformableInfo) {
    const textColor = ((nestLikeColors[info[triple.LEVEL]] as typeof nestLikeColors.info) ||
      nestLikeColors.info) as unknown as Color;
    const headColor = textColor === nestLikeColors.info ? colors.brightBlue : textColor;
    return { textColor, headColor };
  }

  private getMessage(
    info: TransformableInfo,
    isStart: boolean,
    headColor: Color,
    textColor: Color
  ): string[] {
    // eslint-disable-next-line prefer-const
    let [message, ...multipleLines] = info.message.split("\n");

    isStart = isStart || multipleLines.length > 0;
    const chr = DevConsoleFormat.chars[isStart ? "startLine" : "singleLine"];

    const hasMessage = message.replace(DevConsoleFormat.reSpacesOrEmpty, "").length;
    if (!hasMessage) message += `${colors.dim(colors.italic("(no message)"))}`;
    const space = message.match(/^(\s*)/)?.[0] || "";
    const plainMessage = space ? message.replace(space, "") : message;
    const context = info.context || this.opts.context;
    message = `${headColor(
      `:${space}${colors.dim(chr)} ${
        context && context !== this.name ? colors.yellow(`[${context}] `) : ""
      }`
    )}${textColor(plainMessage)}`;

    return [`${info.level}${message}`, ...multipleLines];
  }

  private write(
    info: TransformableInfo,
    multipleMessages: string[],
    metaLines: string[],
    headColor: Color,
    textColor: Color,
    callee?: Callee,
    showTrack?: boolean
  ): void {
    const infoIndex = triple.MESSAGE as unknown as string;
    const pad = this.getPadding(info.message);
    const hasMetaLines = !!metaLines.length;
    this.writeMultipleMessages(
      multipleMessages,
      info,
      headColor,
      textColor,
      pad,
      !hasMetaLines && !showTrack
    );
    //
    // if (this.opts.showTimestamps) {
    // info[infoIndex] += `\n${colors.dim(info.level)}:${pad}${color}${colors.dim(
    // DevConsoleFormat.chars.line
    // )}${this.getTimestamp(info)}`;
    // }

    if (showTrack) {
      const functionName = callee.functionName ? `${callee.functionName}` : "";
      const point = [callee.lineNumber, callee.lineColNum]
        .filter((o) => typeof o === "string")
        .join(":");
      const msg = ` at ${functionName}(${callee.filePath}${point ? `:${point}` : ""})`;

      info[infoIndex] += `\n${headColor(colors.dim(info.level + ":"))}${pad}${headColor(
        `${colors.dim(
          hasMetaLines ? DevConsoleFormat.chars.line : DevConsoleFormat.chars.endLine
        )} ${colors.yellow(colors.dim("[#]"))}${textColor(colors.dim(colors.italic(msg)))}`
      )}`;
    }
    this.writeMetaLines(metaLines, info, headColor, textColor, pad);
    if (this.opts.addLineSeparation) {
      info[infoIndex] += "\n";
    }
  }

  private writeMultipleMessages(
    metaLines: string[],
    info: TransformableInfo,
    headColor: Color,
    textColor: colors.Color,
    pad: string,
    isEnd?: boolean
  ) {
    const infoIndex = triple.MESSAGE as unknown as string;
    for (let lineNumberIndex = 0; lineNumberIndex < metaLines.length; lineNumberIndex++) {
      const line = metaLines[lineNumberIndex];
      const lineNumber = colors.dim(
        `[${(lineNumberIndex + 1).toString().padStart(metaLines.length.toString().length, " ")}]`
      );
      let chr = DevConsoleFormat.chars.line;

      if (isEnd && lineNumberIndex === metaLines.length - 1) {
        chr = DevConsoleFormat.chars.endLine;
      }

      info[infoIndex] += `\n${headColor(`${colors.dim(info.level)}:${pad}${colors.dim(chr)} `)}`;
      info[infoIndex] += colors.dim(`${colors.yellow(lineNumber)} ${textColor(line)}`);
    }
  }

  private writeMetaLines(
    metaLines: string[],
    info: TransformableInfo,
    headColor: Color,
    textColor: colors.Color,
    pad: string
  ) {
    const infoIndex = triple.MESSAGE as unknown as string;
    for (let lineNumberIndex = 0; lineNumberIndex < metaLines.length; lineNumberIndex++) {
      const line = metaLines[lineNumberIndex];
      const lineNumber = colors.dim(
        `[${(lineNumberIndex + 1).toString().padStart(metaLines.length.toString().length, " ")}]`
      );
      let chr = DevConsoleFormat.chars.line;

      if (lineNumberIndex === metaLines.length - 1) {
        chr = DevConsoleFormat.chars.endLine;
      }

      info[infoIndex] += `\n${headColor(`${colors.dim(info.level)}:${pad}${colors.dim(chr)} `)}`;
      info[infoIndex] += `${colors.yellow(lineNumber)} ${line}`;
    }
  }

  public transform(info: TransformableInfo): TransformableInfo {
    const { headColor, textColor } = this.getColor(info);
    info.level = `${
      this.opts.showTimestamps ? this.getTimestamp(info) + colors.brightCyan(" - ") : ""
    }${colors.brightCyan(`[${this.name}]`)} ${headColor(this.upperFirst(info.level))}`;
    const stackLine = this.getStackLines(info);
    const index = triple.MESSAGE as unknown as string;
    const callee = this.getCallee();
    const meta = this.getMetaLines(info);
    const metaLines: string[] = meta.metaLines;
    const showTrack = callee && (info[triple.LEVEL] === "error" || this.opts.showTrack);
    const [message, ...multipleMessages] = this.getMessage(
      info,
      metaLines.length > 0 || stackLine.length > 0 || showTrack,
      headColor,
      textColor
    );
    info[index] = message;
    info[index] = [info[index], ...meta.plainItems].join(" ");
    info[index] += this.getMs(info);

    // console.log("transform", info);
    this.write(
      info,
      multipleMessages.concat(stackLine),
      metaLines,
      headColor,
      textColor,
      callee,
      showTrack
    );
    return info;
  }
}

export const format = (name: string, opts?: DevConsoleFormatOptions): SelfFormat => {
  return Object.assign(
    winston.format.combine(
      ...[
        winston.format.timestamp(),
        winston.format.ms(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
        winston.format.padLevels({
          levels: logLevels,
        }),
        new DevConsoleFormat(name, opts)
      ].filter(Boolean)
    ),
    { opts }
  );
};
export type SelfFormat = Format & { opts?: DevConsoleFormatOptions };
