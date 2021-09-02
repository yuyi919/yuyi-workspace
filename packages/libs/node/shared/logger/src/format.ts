export enum LogLevel {
  Error = "error",
  Success = "success",
  Failed = "failed",
  Warn = "warn",
  Warning = "warning",
  Info = "info",
  Hint = "hint",
  Verbose = "verbose",
  Debug = "debug",
}

export const logLevels = {
  [LogLevel.Error]: 0,
  [LogLevel.Success]: 1,
  [LogLevel.Failed]: 1,
  [LogLevel.Warn]: 2,
  [LogLevel.Warning]: 2,
  [LogLevel.Info]: 2,
  [LogLevel.Hint]: 3,
  [LogLevel.Verbose]: 3,
  [LogLevel.Debug]: 4,
};
