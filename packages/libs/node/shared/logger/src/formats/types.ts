import { InspectOptions } from "util";

export interface Callee {
  functionName: string;
  lineNumber: string;
  lineColNum: string;
  filePath: string;
}

export interface DevConsoleFormatOptions {
  context?: string;
  immediate?: boolean;
  color?: boolean;
  processStrackPath?: (track: string) => string;
  inspectOptions?: InspectOptions;
  /**
   * 展示时间戳
   * @default false
   * @remark 不论配置与否，debug文件日志始终打印时间戳
   */
  showTimestamps?: boolean;
  /**
   * 打印堆栈
   * @default false
   * @remark 不论配置与否，debug文件日志始终打印时间戳
   */
  /**
   * 文件解析的基础路径，打印堆栈时取与基础相对的路径
   * @default process.cwd()
   */
  basePath?: string;
  showTrack?: boolean;
  addLineSeparation?: boolean;
  trackDeep?: number;
}

export type DevConsoleTransportOptions = DevConsoleFormatOptions;
