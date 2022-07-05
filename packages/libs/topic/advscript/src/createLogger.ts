import { snakeCase, upperFirst } from "lodash";
import { bindArgs, is } from "@yuyi919/shared-utils";

export interface ICommonLog {
  /**
   * 打印日志
   * @param message - 文本信息
   * @param optionalParams - 按占位符参数，后续参数的顺序解析
   * @remarks
   * ## message占位符一览
   *
   * %s - 字符串
   *
   * %d/%i - 整型数
   *
   * %f - 浮点数
   *
   * %O - 展示对象（点开才能看到详情）
   *
   * %o - 展示对象（带详情预览）
   */
  (message?: string, ...optionalParams: any[]): void;
}

export interface ISimpleLog {
  /**
   * 打印日志
   * @param conent - 参数
   */
  (...conent: any[]): void;
}
/**
 * 输出日志回调
 * 动态绑定参数返回的日志输出执行函数，目的是为了让浏览器正确定位日志源
 */
export interface ILoggerExecuter {
  /**
   * {@inheritDoc ILoggerExecuter}
   */
  (): void;
}

export function createLogger(name: string | (() => string)) {
  const dynamic = !is.str(name);
  const displayName = !dynamic && upperFirst(snakeCase(name));
  const styles = {
    // label: "background:#00bbee;padding:0 4px;color:white;",
    label: "color:#00bbee;font-weight:bold",
    type: {
      success: "color:mediumseagreen;",
      log: "",
      info: "color:#00bbee;",
      begin: "color:#00bbee;",
      end: "color:mediumseagreen;",
      debug: "color:#999;",
      trace: "color:#999;",
      error: "",
      warn: ""
    },
    content: {
      success: "color:mediumseagreen;",
      log: "",
      info: "color:#00bbee;",
      begin: "",
      end: "",
      debug: "color:#888;",
      trace: "color:#888;",
      error: "",
      warn: ""
    },
    typeTag(type: string) {
      return `[${type}]`;
    },
    labelTag(label: string) {
      return `[${label}]`;
    }
  };
  const label = displayName && styles.labelTag(displayName);
  const toLabelTarget = dynamic && {
    toString() {
      const displayName = upperFirst(snakeCase(name()));
      return styles.labelTag(displayName);
    }
  };
  function commonDefine(type: string, prefix?: boolean, ...args: any[]): ICommonLog {
    const defineType = type in styles.type ? type : "log";
    return bindArgs(
      console[type] || console.log,
      ...([
        `${prefix ? "%c>" : ""}%c${dynamic ? "%s" : label}%c${styles.typeTag(type)}%c%s`,
        prefix && `margin-left:1px;margin-right:2px;color:#666;`,
        styles.label,
        toLabelTarget,
        `${styles.type[defineType]};margin-right:4px;font-weight:bold`,
        `${styles.content[defineType]};`
      ].filter(Boolean) as [any, any, any, any, ...any[]]),
      ...args
    ) as ICommonLog;
  }
  function trackDefine(type: string): (target?: any, ...optionalParams: any[]) => void {
    const defineType = type in styles.type ? type : "info";
    return bindArgs(
      console[type] || console.info,
      ...([
        `%c${dynamic ? "%s" : label}%c${styles.typeTag(type + "Track")}%c%o`,
        styles.label,
        toLabelTarget,
        `${styles.type[defineType]};margin-right:4px;font-weight:bold`,
        `${styles.content[defineType]};`
      ].filter(Boolean) as [any, any, any, any, ...any[]])
    );
  }
  function bannerDefine(type: string, ...args: any[]): ICommonLog {
    return bindArgs(
      console[type] || console.log,
      ...([
        `## %c${dynamic ? "%s" : label}%c%s ##`,
        styles.label,
        toLabelTarget,
        "color:inherit;margin-left:6px;"
      ].filter(Boolean) as [any, any, any, any, ...any[]]),
      ...args
    ) as ICommonLog;
  }
  const logger = {
    clear: console.clear,
    begin: commonDefine("begin", true),
    end: commonDefine("end", true),
    log: commonDefine("log", true),
    info: commonDefine("info", true),
    success: commonDefine("success", true),
    debug: commonDefine("debug", true),
    trace: commonDefine("trace"),
    error: commonDefine("error"),
    warn: commonDefine("warn"),
    banner: bannerDefine("log"),
    group: bannerDefine("group"),
    groupCollapsed: bannerDefine("groupCollapsed"),
    /**
     * @returns 返回一个打印groupEnd的函数, {@link ISimpleLog}
     */
    groupEnd(): ISimpleLog {
      console.groupEnd();
      return bindArgs(logger.banner, "end");
    },
    /**
     * @returns see {@link ILoggerExecuter}
     */
    count(label: string = "default"): ILoggerExecuter {
      return bindArgs(console.count, `[${displayName}][count:${label}]`);
    },
    countReset(label: string = "default"): ISimpleLog {
      console.countReset(`[${displayName}][count:${label}]`);
      return bindArgs(logger.debug, `[count:${label}] Reset`);
    },
    time(label: string = "default"): ISimpleLog {
      console.time(`[${displayName}][cost:${label}]`);
      return bindArgs(logger.begin, `## time:${label} ##`);
    },
    timeLog(label: string = "default"): ILoggerExecuter {
      return bindArgs(console.timeLog, `[${displayName}][cost:${label}]`);
    },
    timeEnd(label: string = "default"): ISimpleLog {
      console.timeEnd(`[${displayName}][cost:${label}]`);
      return bindArgs(logger.end, `## time:${label} ##`);
    },
    errorTrack: trackDefine("error")
  };
  logger.count("test")();
  return logger;
}
