/* eslint-disable @typescript-eslint/consistent-type-definitions */
import Types, { isArr, isNum, isUndefined, CompareFn } from "@yuyi919/shared-types";
import { ARR_CONCAT, bindArgList, bindArgs, isStr, stubFunction } from "@yuyi919/shared-utils";
import { ARRAY } from "@yuyi919/shared-constant";

/**
 * 输出日志
 * @param message - 文本信息
 * @param optionalParams - 按占位符参数, 后续参数的顺序解析
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
 * @public
 */
export type CommonLog = {
  /**
   * 输出日志
   * @param message - 文本信息
   * @param optionalParams - 按占位符参数, 后续参数的顺序解析
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
};

/**
 * 输出跟踪栈日志
 * @param target - 目标对象
 * @param others - 其他内容
 * @public
 */
export type TrackLog = {
  /**
   * 输出日志
   * @param target - 目标对象
   * @param others - 其他内容
   */
  (target?: any, ...others: any[]): void;
};

/**
 * 输出日志
 * @param contents - 输出内容
 * @public
 */
export type TraceLoggerCaller = {
  /**
   * @param contents - 输出内容
   */
  (...contents: any[]): void;
};

/**
 * 调用此函数输出日志
 *
 * 动态绑定参数返回的日志输出执行函数, 目的是为了让浏览器正确定位日志源位置
 * @public
 */
export type LoggerCaller = {
  /**
   * 为了让浏览器正确定位日志源代码，需调用此函数输出日志
   */
  (): void;
};

const COMMON_LOG = ["begin", "end", "info", "log", "success", "debug"] as const;
const COMMON_LOG2 = ["trace", "error", "warn"] as const;
const colorMap = {
  G: "mediumseagreen",
  B: "#00bbee",
  R: "#c0392b",
  Y: "#f39c12",
  _GREY: "#999",
  _DEFAULT: "#999"
} as const;

const timestampObj = {
  toString() {
    return new Date().toLocaleString();
  }
};

/**
 * 日志配置项
 * @public
 */
export interface LoggerOption {
  /** 展示时间戳标签 */
  timestamp?: boolean;
  /** 展示log类型标签 */
  type?: boolean;
  /** log（命名空间/类型/时间戳）展示样式 */
  tagStyle?: "fill" | "text";
  /** 禁用logger */
  disabled?: boolean;
}

const NAME_STYLES = {
  fill: (color: string) =>
    `background:${color};border-radius:0.2em;color:white;font-weight:bold;padding:2px 0.5em;margin-right:4px;`,
  text: (color: string) => `color:${color};font-weight:bold;margin-right:4px;`
};
const emoji = {
  log: "🗯️",
  success: "✔️",
  info: "ℹ️",
  error: "❌",
  warn: "⚠️",
  debug: "⚙️",
  trace: "🔎",
  begin: "🔥",
  end: "😊",
  time: "⏳",
  cost: "⌛",
  count: "⏲️"
};
const NAME_TEXT_WRAPPER = {
  fill: (name: string) => `${name}`,
  text: (name: string) => emoji[name] || `[${name}]`
};

/**
 *
 * @param name - 命名空间, 允许传入一个函数
 * @public
 */
export function createLogger(
  name: string | (() => string),
  options: LoggerOption = {}
): ISampleLogger {
  const dynamic = !isStr(name);
  const displayName = !dynamic && name;
  const tagStyle = options.tagStyle || "text";
  const disabled = options.disabled ?? process.env.NODE_ENV === "production";
  const { timestamp, type: showType = true } = options;
  const { [tagStyle]: nameStyle } = NAME_STYLES;
  const { [tagStyle]: nameTextWrapper } = NAME_TEXT_WRAPPER;
  const styles = {
    _label: nameStyle(colorMap.B),
    _type: {
      success: colorMap.G,
      log: "",
      info: colorMap.B,
      begin: colorMap.B,
      end: colorMap.G,
      debug: colorMap._GREY,
      trace: colorMap._GREY,
      error: colorMap.R,
      warn: colorMap.Y
    },
    _content: {
      success: colorMap.G,
      log: "",
      info: colorMap.B,
      begin: "",
      end: "",
      debug: colorMap._DEFAULT,
      trace: colorMap._DEFAULT,
      error: colorMap.R,
      warn: ""
    },
    _typeTag(type: string) {
      return nameTextWrapper(type);
    },
    _labelTag(label: string) {
      return nameTextWrapper(label);
    }
  };
  const label = displayName && styles._labelTag(displayName);
  const toLabelTarget = dynamic && {
    toString() {
      const displayName = name();
      return styles._labelTag(displayName);
    }
  };
  const Console = console;

  const _tagStyle = (type: string, defaultColor?: string) =>
    `${nameStyle(styles._type[type] || defaultColor)};margin-right:4px;font-weight:bold`;
  function useLabel() {
    return {
      _str: "%c" + (dynamic ? "%s" : label),
      _args: dynamic ? [styles._label, toLabelTarget] : [styles._label]
    };
  }
  function usePrefix(prefix: boolean) {
    return {
      _str: prefix ? "%c>" : "",
      _args: prefix ? [`margin-left:1px;margin-right:2px;color:#666;`] : []
    };
  }
  function useTypeTag(type: string) {
    const _styleType = type in styles._type ? type : "log";
    return {
      _str: showType ? "%c" + styles._typeTag(type) : "",
      _args: showType ? [_tagStyle(_styleType, "black")] : [],
      _styleType
    };
  }
  function useTimestamp(styleType: string) {
    return {
      _str: timestamp ? `%c%s` : "",
      _args: timestamp ? [_tagStyle(styleType, "black"), timestampObj] : []
    };
  }
  function useContent(styleType: string, content?: boolean) {
    return {
      _str: content ? "%c%s" : "%c",
      _args: [`${styles._content[styleType]}`]
    };
  }
  function commonDefine(type: string, prefix?: boolean, ...args: any[]): CommonLog {
    if (disabled) return stubFunction;
    const _prefix = usePrefix(prefix);
    const label = useLabel();
    const typeTag = useTypeTag(type);
    const timestamp = useTimestamp(typeTag._styleType);
    const content = useContent(typeTag._styleType, true);
    return bindArgList(
      Console[type] || Console.log,
      ARR_CONCAT(
        join_item(_prefix, label, timestamp, typeTag, content),
        _prefix._args,
        label._args,
        timestamp._args,
        typeTag._args,
        content._args,
        args
      ) as [any, any, any, any]
    ) as CommonLog;
  }
  function trackDefine(type: string): TrackLog {
    if (disabled) return stubFunction;
    const label = useLabel();
    const typeTag = useTypeTag(type);
    const timestamp = useTimestamp(typeTag._styleType);
    const content = useContent(typeTag._styleType, true);
    return bindArgList(
      Console[type] || Console.info,
      ARR_CONCAT(
        join_item(label, timestamp, typeTag, content),
        label._args,
        timestamp._args,
        typeTag._args,
        content._args
      )
    );
  }
  function bannerDefine(type: string): CommonLog {
    if (disabled) return stubFunction;
    const timestamp = useTimestamp("debug");
    const label = useLabel();
    const content = useContent("log", true);
    return bindArgList(
      Console[type] || Console.log,
      ARR_CONCAT(
        `## ${join_item(label, timestamp, content)} ##`,
        label._args,
        timestamp._args,
        content._args
      )
    ) as CommonLog;
  }
  function tagTexts(...tags: Types.Primitive[]): string;
  function tagTexts(): string {
    let l = "🔥" + nameTextWrapper(dynamic ? name() : displayName),
      // eslint-disable-next-line prefer-const
      _args = arguments;
    for (let i = 0; i < _args.length; i++) {
      !isUndefined(_args[i]) && (l += nameTextWrapper(_args[i]));
    }
    return l;
  }

  function useProperties(target: any, { limit, sort, index }: PropertiesOptions = {}) {
    limit ??= 10;
    let _limited = false;
    const hasLimit = limit > 0,
      isMap = target instanceof Map,
      isArray = isArr(target);
    index ??= isArray;
    const keys = isArray
      ? // 如果为数组，则只展示最多 {limit} 条
        ARRAY(hasLimit && target.length > limit ? ((_limited = true), limit) : target.length).fill(
          true
        )
      : isMap
      ? ARRAY.from(target.keys())
      : Object.keys(target);
    if (hasLimit && keys.length > limit) {
      _limited = true;
      // 删除超过数组上限
      keys.splice(limit, keys.length - limit);
    }
    if (sort) {
      keys.sort(sort);
    }
    return {
      _str: `%c${keys
        .map(
          (key, _index) =>
            ` ${index ? _index + "." : "-"}${
              isArray ? "" : ` %${isNum(key) || isMap ? "o" : "s"}:`
            } %o`
        )
        .join("\n")}${_limited ? "\n ...more: %O" : ""}`,
      _args: ARR_CONCAT(
        "",
        keys
          .map((p, index) => (isArray ? [target[index]] : [p, isMap ? target.get(p) : target[p]]))
          .flat(1),
        _limited ? [target] : []
      )
    };
  }

  const logger = {
    clear: Console.clear as () => void,
    errorTrack: trackDefine("error"),
    banner: bannerDefine("log"),
    group: bannerDefine("group"),
    groupCollapsed: bannerDefine("groupCollapsed"),
    properties(target: any, options?: PropertiesOptions) {
      const type = options?.type || "log";
      const label = useLabel();
      const typeTag = useTypeTag(type);
      const timestamp = useTimestamp(typeTag._styleType);
      const barContent = useContent("log");
      const content = useContent("log", true);
      const properties = useProperties(target, options);
      return bindArgs(
        Console[type] || Console.log,
        [
          `## ${join_item(label, timestamp, typeTag, barContent)} ##`,
          properties._str,
          `=== ${content._str}`
        ].join("\n"),
        ...(ARR_CONCAT(
          label._args,
          timestamp._args,
          typeTag._args,
          barContent._args,
          properties._args,
          content._args
        ) as [any, any, any, any])
      ) as CommonLog;
    },
    groupEnd(): TraceLoggerCaller {
      if (disabled) return () => stubFunction;
      Console.groupEnd();
      return bindArgs(logger.banner, "end");
    },
    count(label?: Types.Primitive): LoggerCaller {
      if (disabled) return () => stubFunction;
      return bindArgs(Console.count, tagTexts(label, "count"));
    },
    countReset(label?: Types.Primitive): TraceLoggerCaller {
      if (disabled) return () => stubFunction;
      Console.countReset(tagTexts(label, "count"));
      return bindArgs(logger.debug, `${tagTexts(label, "count")} Reset`);
    },
    time(label?: Types.Primitive): TraceLoggerCaller {
      if (disabled) return () => stubFunction;
      Console.time(tagTexts(label, "cost"));
      return bindArgs(logger.begin, `## ${tagTexts(label, "time")} ##`);
    },
    timeLog(label?: Types.Primitive): LoggerCaller {
      if (disabled) return () => stubFunction;
      return bindArgs(Console.timeLog, tagTexts(label, "cost"));
    },
    timeEnd(label?: Types.Primitive): TraceLoggerCaller {
      if (disabled) return () => stubFunction;
      Console.timeEnd(tagTexts(label, "cost"));
      return bindArgs(logger.end, `## ${tagTexts(label, "time")} ##`);
    }
  } as ISampleLogger;
  for (const tag of COMMON_LOG) {
    logger[tag] = commonDefine(tag, true);
  }
  for (const tag of COMMON_LOG2) {
    logger[tag] = commonDefine(tag);
  }

  return logger;
}

function join_item(...args: { str?: string; _str?: string }[]): string;
function join_item(): string {
  let right = "";
  for (let i = 0, list = arguments; i < list.length; i++) {
    right += list[i].str || list[i]._str;
  }
  return right;
}
/**
 * @public
 */
export interface PropertiesOptions {
  /**
   * 日志类型
   * @defaultValue
   * ```ts
   * "log"
   * ```
   */
  type?: string;
  /**
   * 输出条数上限，指定0则取消限制展示
   * @defaultValue
   * ```ts
   * 10
   * ```
   */
  limit?: number;
  /**
   * 排序对象/Map键（或数组索引）的函数
   */
  sort?: CompareFn;
  /**
   * @defaultValue
   * 如果目标对象为数组，默认为true
   */
  index?: boolean;
}

/**
 * 日志函数集
 * @public
 */
export interface ISampleLogger {
  /**
   * {@inheritDoc CommonLog}
   */
  log: CommonLog;
  /**
   * {@inheritDoc CommonLog}
   */
  begin: CommonLog;
  /**
   * {@inheritDoc CommonLog}
   */
  end: CommonLog;
  /**
   * {@inheritDoc CommonLog}
   */
  info: CommonLog;
  /**
   * {@inheritDoc CommonLog}
   */
  success: CommonLog;
  /**
   * {@inheritDoc CommonLog}
   */
  debug: CommonLog;
  /**
   * {@inheritDoc CommonLog}
   */
  trace: CommonLog;
  /**
   * {@inheritDoc CommonLog}
   */
  error: CommonLog;
  /**
   * {@inheritDoc CommonLog}
   */
  warn: CommonLog;
  /**
   * {@inheritDoc CommonLog}
   */
  banner: CommonLog;
  /**
   * {@inheritDoc CommonLog}
   */
  group: CommonLog;
  /**
   * {@inheritDoc CommonLog}
   */
  groupCollapsed: CommonLog;
  /**
   * {@inheritDoc TrackLog}
   */
  errorTrack: TrackLog;
  /**
   * 参照console.groupEnd
   * @returns 返回一个函数, 调用它则会输出groupEnd日志信息
   */
  groupEnd(): TraceLoggerCaller;
  /**
   * 参照console.count, 但不会马上输出
   * @returns 返回一个函数, 调用输出count日志
   */
  count(label?: Types.Primitive): LoggerCaller;
  /**
   * 参照console.countReset
   * @returns 返回一个函数, 调用它则会输出countReset日志信息
   */
  countReset(label?: Types.Primitive): TraceLoggerCaller;
  /**
   * 参照console.time
   * @returns 返回一个函数, 调用它则会输出timeStart日志信息
   */
  time(label?: Types.Primitive): TraceLoggerCaller;
  /**
   * 参照console.timeLog, 但不会马上输出
   * @returns 返回一个函数, 调用输出timeLog日志
   */
  timeLog(label?: Types.Primitive): LoggerCaller;
  /**
   * 参照console.timeEnd
   * @returns 返回一个函数, 调用它则会输出timeEnd日志信息
   */
  timeEnd(label?: Types.Primitive): TraceLoggerCaller;

  properties(target: Types.Recordable | Map<any, any>, options?: PropertiesOptions): CommonLog;

  /**
   * 参照console.clear
   */
  clear(): void;
}
