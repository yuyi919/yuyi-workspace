/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-constructor */
/* eslint-disable no-use-before-define */
import { cloneDeep, defaults, upperFirst } from "lodash";

export interface LoggerOption {
  /**
   * 启用
   * @default
   * ```typescript
   * process.env.NODE_ENV === 'development'
   * ```
   * @example
   * createLogger("System", { enabled: false })
   */
  enabled?: boolean;

  /**
   * 基本样式
   * @example
   * createLogger("StyledLogger", {
   *   style: {
   *     main: 'color: white;',
   *     content: 'font-size:20px;color:white;',
   *     line: 'background:black;',
   *     error: {
   *       line: 'background:yellow;'
   *     }
   *   }
   * })
   */
  style?: boolean | LoggerStyle;

  /**
   * 输出数据是否为不可变类型
   * 对于原型链对象 或 Object.isFrozen()===true的对象无效
   */
  immediate?: boolean | (<T>(V: T) => T);

  /**
   * 打印堆栈信息？
   * @default false
   */
  stack?: boolean | "async";

  /**
   * 为了准确mark调用log的行，需要配置执行栈深度
   * 如果需要包装可以手动传入更深的深度
   * @default 5
   */
  stackDeep?: number;

  /**
   * 启用调试模式，在输出前缀[<logType>:打印次数]
   */
  debugger?: boolean;
}

interface LoggerStyle {
  main?: string;
  content?: string;
  other?: string;
  line?: string;
  error?: Omit<LoggerStyle, "error">;
}

export function createLogger(name: string = "", option?: LoggerOption) {
  return new Logger(name, option);
}

class DebugInstance {
  constructor(target: any) {
    Object.defineProperty(this, "JSON", {
      get() {
        return JSON.stringify(target);
      }
    });
  }
}
class Source {
  constructor(target: Promise<string> | string) {
    if (target instanceof Promise) {
      target.then((r) => (target = r));
    }
    Object.defineProperty(this, "file", {
      get() {
        console.log(target);
        return "loaded";
      }
    });
  }
}

class GlobalLoggerMap extends Map<string, Logger> {
  getHistorys() {
    const record = {};
    for (const logger of this.values()) {
      record[logger.name] = logger.historyList;
    }
    return record;
  }
}
const globalLoggerMap = new GlobalLoggerMap();

interface LogRecord {
  // extends Partial<import("source-map").MappedPosition>
  sourceContent?: string;
  sourceLine?: string;
  args: any[];
}

export class Logger {
  historyList: LogRecord[] = [];

  get _globalMap() {
    return globalLoggerMap;
  }

  constructor(public name: string = "Global", public option: LoggerOption = {}) {
    defaults(option, {
      enabled: process.env.NODE_ENV === "development"
    });
    globalLoggerMap.set(name, this);
  }
  appendHistory(content: any[]) {
    const currentId = this.historyList.length;
    this.historyList.push({ args: content });
    return currentId;
  }
  static defaultStyle: LoggerStyle = {
    main: "color: #00bbee;", // 第一部分 main
    content: "color: #888;", // 第二部分 默认content
    other: "color: #333;", // 第三部分 track
    line: "",
    error: {
      main: "color: red;", // 第一部分 main
      content: "color: red;", // 第二部分 默认content
      other: "color: red;" // 第三部分 track
    }
  };
  static defaultOption: LoggerOption = {
    enabled: true,
    immediate: true,
    style: true,
    stackDeep: 5,
    stack: false
  };

  get localOption() {
    return defaults(this.option, Logger.defaultOption);
  }

  get enable() {
    return this.localOption.enabled;
  }

  get immediate() {
    return this.localOption.immediate;
  }

  get style(): LoggerStyle {
    const style = this.localOption.style;
    return style !== false
      ? style instanceof Object
        ? this._processStyle(style, Logger.defaultStyle)
        : Logger.defaultStyle
      : {};
  }

  _processStyle(style: LoggerStyle, defaultStyle: LoggerStyle, hasError = true): LoggerStyle {
    const main = {
      line: `${defaultStyle.line}; ${style.line}`,
      main: `${defaultStyle.main}; ${style.main}`,
      content: `${defaultStyle.content}; ${style.content}`,
      other: `${defaultStyle.other}; ${style.other}`
    };
    if (!hasError) return main;
    return {
      ...main,
      error: this._processStyle(
        this._processStyle(style.error, defaultStyle.error, false),
        main,
        false
      )
    };
  }

  log(...content: any[]) {
    this.logger("log", ...content);
  }
  logAsync(...content: any[]) {
    this.loggerAsync("log", ...content);
  }

  debug(...content: any[]) {
    this.logger("debug", ...content);
  }
  debugAsync(...content: any[]) {
    this.loggerAsync("debug", ...content);
  }

  error(...content: any[]) {
    this.logger("error", ...content);
  }
  errorAsync(...content: any[]) {
    this.loggerAsync("error", ...content);
  }

  getTarget<T>(target: T) {
    if (
      this.immediate &&
      target &&
      !Object.isFrozen(target) &&
      (target.constructor === Object || target.constructor === Array)
    ) {
      const tagMatched = /^\[object (.+)\]$/.exec(target.toString());
      if (!tagMatched || tagMatched[1] === "Object") {
        // console.log("cloneDeep", target);
        return cloneDeep(target);
      }
    }
    return target;
  }

  logger(logType: keyof typeof console, ...content: any[]) {
    if (!this.enable) return;
    const currentId = this.appendHistory(content);
    const { textContent, targets } = getContent(content.map((o) => this.getTarget(o)));
    const main = `[${this.option.debugger ? `${upperFirst(logType)}:${currentId}:` : ""}${
      this.name || ""
    }]`;
    let { style } = this;
    if (logType === "error") {
      style = style.error;
    }
    const messages = formatter(this, currentId, main, textContent, style);
    const resultId =
      messages instanceof Promise &&
      messages.hasSource &&
      new Source(messages.then((r) => r && r[r.length - 1]));
    this.formatter(
      targets,
      resultId ? [...messages.result, resultId] : messages.result,
      logType,
      main,
      style
    );
  }

  loggerAsync(logType: keyof typeof console, ...content: any[]) {
    if (!this.enable) return;
    const currentId = this.appendHistory(content);
    const { textContent, targets } = getContent(content.map((o) => this.getTarget(o)));
    const main = `[${this.option.debugger ? `${upperFirst(logType)}:${currentId}:` : ""}${
      this.name || ""
    }]`;
    let { style } = this;
    if (logType === "error") {
      style = style.error;
    }
    const messages = formatter(this, currentId, main, textContent, style);
    return messages instanceof Promise && messages?.hasSource
      ? messages.then((messages) => {
          this.formatter(targets, messages, logType, main, style);
        })
      : this.formatter(targets, messages.result, logType, main, style);
  }

  private formatter(
    targets: [string, any, ("dir" | "table" | "toString")?][],
    messages: any[],
    logType: string,
    main: string,
    style: LoggerStyle
  ) {
    if (targets.length) {
      console.groupCollapsed.apply(null, messages);
    } else {
      console[logType].apply(null, messages);
    }
    for (let i = 0; i < targets.length; i++) {
      const type = targets[i][2];
      if (type) {
        console.groupCollapsed.apply(null, formatterOther(main, targets[i], style));
        const target = targets[i][1];
        if (type === "dir") {
          console[logType](new DebugInstance(target));
        } else if (type in console) {
          console[type](target);
        } else if (type === "toString") {
          const str = target.toString?.();
          console.info(str ? `%c${JSON.stringify(str)}` : target, "color: green;");
        }
        console.groupEnd();
      } else {
        console[logType].apply(null, formatterOther(main, targets[i], style));
      }
      if (i === targets.length - 1) {
        console.groupEnd();
      }
    }
  }
}

function formatter(
  logger: Logger,
  currentId: number,
  main: string,
  content: (string | [string, string])[],
  style: Omit<LoggerStyle, "error"> = {}
): (Promise<string[]> | {}) & { result: string[]; hasSource: boolean } {
  const contentStyles = content.map((option) =>
    option instanceof Array
      ? option.map((item, index) => (index === 0 ? style.content + item : item))
      : [style.content, option]
  );
  const result = [
    `%c${main.trim()}%c %c${contentStyles.map((item) => "%c" + item[1]).join(" ")}`,
    `font-weight:bold;${style.line};${style.main}`, // 第一部分 main
    style.line, //重定义
    `${style.line};${style.content};`, // 第二部分 默认content
    ...contentStyles.map(([selfStyle]) => `${style.line};${selfStyle}`) // 第三部分 content 各自处理
  ];
  const asyncStack = logger.localOption.stack === "async";
  const track = logger.localOption.stack && getTrack(logger, currentId);
  const { hasSource } = track || {};
  if (hasSource || asyncStack) {
    result[0] += `%c %cat`;
    result.push(
      style.line, //重定义
      `${style.line};${style.other}` // 第三部分 track
    );
  }
  return Object.assign(
    (asyncStack &&
      track instanceof Promise &&
      track.then((line) => {
        // console.log(content, contentStyles);
        return line && [...result, line];
      })) ||
      {},
    {
      result: logger.localOption.stack && !asyncStack ? [...result, track.result] : result,
      hasSource
    }
  );
}
function formatterOther(
  main: string,
  [name, target]: [string, any, ("table" | "toString" | "dir")?],
  style: LoggerStyle = {}
) {
  return [
    `%c${main.trim()}%c - %c${name.trim()}%c %c`,
    `font-weight: bold; ${style.line}; ${style.main}`,
    style.line, //重定义
    `font-weight: bold; ${style.line}; ${style.content}`,
    style.line, //重定义
    `${style.line}; ${style.other}`,
    target
  ];
}
// async function sourcemapCatch(logger: Logger, url: string, row: number, col: number) {
//   if (url.startsWith("http") && url.endsWith(".js.map")) {
//     try {
//       const { SourceMapConsumer } = await import("source-map");
//       const rawSourceMap = JSON.parse(await fetch(url).then((r) => r.text()));
//       const consumer = new SourceMapConsumer(rawSourceMap);
//       const originalPosition = consumer.originalPositionFor({
//         line: row, // 报错的行
//         column: col, // 报错的列
//       });
//       if (originalPosition.source && /@fs/.test(url)) {
//         originalPosition.source = path
//           .join(url, "..", originalPosition.source)
//           .replace("http:/", "http://");
//       }
//       // 错误所对应的源码
//       let sourceContent =
//         originalPosition.source && consumer.sourceContentFor(originalPosition.source);
//       if (originalPosition.source && !sourceContent) {
//         sourceContent = await fetch(originalPosition.source).then((r) => r.text());
//       }
//       if (!sourceContent)
//         return {
//           ...originalPosition,
//           sourceContent,
//           sourceLine: null,
//         };
//       return {
//         ...originalPosition,
//         sourceContent,
//         sourceLine: sourceContent.split("\n")[originalPosition.line - 1],
//       };
//     } catch (error) {
//       // console.error("catch", error);
//     }
//   }
// }
function getTrack(logger: Logger, currentId: number) {
  try {
    throw Error();
  } catch (error) {
    const result: string = error.stack?.split(" at ")?.[logger.localOption.stackDeep]?.trim() || "";
    const [, url, row, col] =
      /^(.+):([0-9]+):([0-9]+)$/.exec(result.replace(/\)(.*)$/, "").replace(/^(.*?)\(/, "")) || [];
    const hasSource = url.endsWith(".js");
    return Object.assign(
      // hasSource
      //   ? sourcemapCatch(logger, url + ".map", parseInt(row), parseInt(col)).then((data) => {
      //       if (logger.historyList[currentId] && data && data.source) {
      //         Object.assign(logger.historyList[currentId], data);
      //         return data.source + ":" + data.line + ":" + data.column; // .replace(/\/\/\/(.+)loader\/(.+)\?!/, "///")
      //       }
      //       return result;
      //     })
      //   :
      {},
      {
        result,
        hasSource
      }
    );
  }
}
function getContent(content: any[]) {
  const targets: [string, any, ("table" | "toString" | "dir")?][] = [];
  const textContent: (string | [string, string])[] = content
    .map((o, index) => {
      if (o === void 0) {
        return "undefined";
      } else if (o === null) {
        return "null";
      } else if (typeof o === "string") {
        // 文本展示绿色并标注为文本，但是第一个视作Label所以不作处理
        return index === 0 ? o : ["color: brown;", JSON.stringify(o)];
      } else if (typeof o === "symbol") {
        // symbol展示紫色
        return ["color: brown;", JSON.stringify(o.toString())];
      } else if (o instanceof Array) {
        const name = `[Array:${targets.length}]`;
        targets.push([name, o, "table"]);
        return name;
      } else if (typeof o === "function") {
        const name = `[Function:${targets.length}]`;
        targets.push([name, o, "toString"]);
        return ["color: black", name];
      } else if (o instanceof Object) {
        const name = `[${getTargetConstructorName(o)}:${targets.length}]`;
        targets.push([name, o, "dir"]);
        return name;
      }
      return ["color: blue;", o.toString()];
    })
    .filter((o) => o) as any;
  return { textContent, targets };
}
function getTargetConstructorName(o: any) {
  const name = o.constructor?.name;
  const str = o?.toString();
  const tagName = /^\[object (.+)\]$/.exec(str)?.[1];
  return (
    (tagName !== "Object" && tagName) ||
    (name && (name === "Function" ? o.prototype?.constructor?.name : name)) ||
    "Object"
  );
}

export interface ILogger extends Logger {}
export function getGlobalMap() {
  return globalLoggerMap;
}
