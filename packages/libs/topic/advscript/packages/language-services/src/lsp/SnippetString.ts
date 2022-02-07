import { FeatureCrossReference } from "./follow-element-computation";
import { FeatureData } from "./wrapAllAlternatives";

export class SnippetString {
  static isSnippetString(thing: any): thing is SnippetString {
    if (thing instanceof SnippetString) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return typeof (<SnippetString>thing).value === "string";
  }

  private static _escape(value: string): string {
    return value.replace(/\$|}|\\/g, "\\$&");
  }

  private _tabstop: number = 1;

  value: string;

  constructor(value?: string, label?: string) {
    this.value = value || "";
  }

  appendText(string: string): SnippetString {
    this.value += SnippetString._escape(string);
    return this;
  }

  appendTabstop(number: number = this._tabstop++): SnippetString {
    this.value += "$";
    this.value += number;
    return this;
  }

  appendPlaceholder(
    value: string | ((snippet: SnippetString) => any),
    number: number = this._tabstop++
  ): SnippetString {
    if (typeof value === "function") {
      const nested = new SnippetString();
      nested._tabstop = this._tabstop;
      value(nested);
      this._tabstop = nested._tabstop;
      value = nested.value;
    } else {
      value = SnippetString._escape(value);
    }

    this.value += "${";
    this.value += number;
    this.value += ":";
    this.value += value;
    this.value += "}";
    return this;
  }

  appendChoice(values: string[], number: number = this._tabstop++): SnippetString {
    const value = values.map((s) => s.replace(/}|\\|,/g, "\\$&")).join(",");
    this.value += `\${${number}|${value}|}`;
    return this;
  }

  appendVariable(
    name: string,
    defaultValue?: string | ((snippet: SnippetString) => any)
  ): SnippetString {
    if (typeof defaultValue === "function") {
      const nested = new SnippetString();
      nested._tabstop = this._tabstop;
      defaultValue(nested);
      this._tabstop = nested._tabstop;
      defaultValue = nested.value;
    } else if (typeof defaultValue === "string") {
      defaultValue = defaultValue.replace(/}/g, "\\$&");
    }

    this.value += "${";
    this.value += name;
    if (defaultValue) {
      this.value += ":";
      this.value += defaultValue;
    }
    this.value += "}";

    return this;
  }
}

export class SnippetHelper extends SnippetString {
  static isSnippetString(thing: any): thing is SnippetHelper {
    if (thing instanceof SnippetHelper) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return typeof (<SnippetHelper>thing).value === "string";
  }
  constructor(value?: string, label?: string) {
    super(value);
    this._reset(label);
  }
  protected preview: string;
  protected prefixText: string;
  private _recordPrefix: boolean;

  private _reset(label?: string) {
    this.preview = label || "";
    this._recordPrefix = true;
    this.prefixText = label || "";
    // @ts-ignore
    this._tabstop = 1;
  }
  reset(value?: string, label?: string) {
    this.value = value || "";
    this._reset(label);
  }

  next(value?: string) {
    const r = {
      value: this.value,
      preview: this.preview,
      prefixText: this.prefixText || undefined,
    };
    this.reset(value);
    return r;
  }

  appendText(string: string): SnippetHelper {
    super.appendText(string);
    this.preview += string;
    if (this._recordPrefix) {
      this.prefixText += string;
    }
    return this;
  }

  appendPlaceholder(value: string, number?: number, label?: string): SnippetHelper {
    super.appendPlaceholder(value, number);
    this.preview += label || value;
    this._recordPrefix = false;
    return this;
  }

  appendChoice(values: string[], number?: number, label?: string): SnippetHelper {
    super.appendChoice(values, number);
    this.preview +=
      (this.preview.length ? " " : "") +
      (typeof label === "string" ? `${label} ` : `$choice:${values.join("|")} `);
    this._recordPrefix = false;
    return this;
  }

  appendVariable(
    name: string | SnippetVariables,
    defaultValue?: string | ((snippet: SnippetString) => any),
    label?: string
  ): SnippetHelper {
    name = typeof name === "number" ? SnippetVariables[name] : name;
    super.appendVariable(name, defaultValue);
    this.preview += label || `$${name}`;
    this._recordPrefix = false;
    return this;
  }
}

export enum SnippetStringItemKind {
  Text,
  Placeholder,
  Choice,
  Variable,
  Reference,
  Tabstop,
}
export type SnippetTextItem = {
  kind: SnippetStringItemKind.Text;
  value: string;
};

export type SnippetChoiceItem = {
  kind: SnippetStringItemKind.Choice;
  values: string[];
  name?: string;
};

export type SnippetPlaceholderItem = {
  kind: SnippetStringItemKind.Placeholder;
  name: string;
  data?: FeatureData;
};

export type SnippetVariableItem = {
  kind: SnippetStringItemKind.Variable;
  defaultValue?: string;
  type: string | SnippetVariables;
};
export type SnippetReferenceItem = {
  kind: SnippetStringItemKind.Reference;
  type: string;
  data?: FeatureData<FeatureCrossReference>;
};
export function isSnippetReferenceItem(item: unknown): item is SnippetReferenceItem {
  return (
    (item as SnippetItem)?.kind === SnippetStringItemKind.Reference &&
    !!(item as SnippetReferenceItem).data
  );
}
export function isSnippetPlaceholderItem(item: unknown): item is SnippetPlaceholderItem {
  return (
    (item as SnippetItem)?.kind === SnippetStringItemKind.Placeholder &&
    !!(item as SnippetPlaceholderItem).name
  );
}


export type SnippetItem =
  | SnippetTextItem
  | SnippetChoiceItem
  | SnippetPlaceholderItem
  | SnippetVariableItem
  | SnippetReferenceItem;

export enum SnippetVariables {
  /** 当前选中的文本或空字符串 */
  TM_SELECTED_TEXT,
  TM_CURRENT_LINE, // 当前行的内容
  TM_CURRENT_WORD, // 光标下单词的内容或空字符串
  TM_LINE_INDEX, // 基于零索引的行号
  TM_LINE_NUMBER, // 基于一个索引的行号
  TM_FILENAME, // 当前文档的文件名
  TM_FILENAME_BASE, // 当前文档的文件名，不带扩展名
  TM_DIRECTORY, // 当前文档的目录
  TM_FILEPATH, // 当前文档的完整文件路径
  RELATIVE_FILEPATH, // 当前文档的相对（相对于打开的工作区或文件夹）文件路径
  CLIPBOARD, // 剪贴板的内容
  WORKSPACE_NAME, // 打开的工作区或文件夹的名称
  WORKSPACE_FOLDER, // 打开的工作区或文件夹的路径

  //插入当前日期和时间：
  CURRENT_YEAR, // 本年度
  CURRENT_YEAR_SHORT, // 当前年份的最后两位数字
  CURRENT_MONTH, // 月份为两位数（例如“02”）
  CURRENT_MONTH_NAME, // 月份的全名（例如“七月”）
  CURRENT_MONTH_NAME_SHORT, // 月份的简称（例如“Jul”）
  CURRENT_DATE, //
  CURRENT_DAY_NAME, // 日期名称（例如“星期一”）
  CURRENT_DAY_NAME_SHORT, // 一天的简称（例如“星期一”）
  CURRENT_HOUR, // 24 小时制的当前小时
  CURRENT_MINUTE, //
  CURRENT_SECOND, // 当前秒为两位数
  CURRENT_SECONDS_UNIX, // 自 Unix 纪元以来的秒数

  //插入随机值：
  RANDOM, // 6 位随机 Base-10 数字
  RANDOM_HEX, // 6 位随机 Base-16 数字
  UUID, // 版本 4 UUID

  // 对于插入行或块注释,，遵循当前语言：
  BLOCK_COMMENT_START, //示例输出：PHP/*或 HTML<!--
  BLOCK_COMMENT_END, //示例输出：PHP*/或 HTML-->
  LINE_COMMENT, // 示例输出：在 PHP 中 //
}
