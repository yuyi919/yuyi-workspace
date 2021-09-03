/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { LogLevel, logLevels, createLogger } from "@yuyi919/node-logger";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { setupYargs, setupConfig, x } from "./index";
import { isProduction, rootDir } from "./lib/env";

const loglevelArr = Object.keys(logLevels);

export class Main {
  @x.Group("全局配置")
  @x.Option({
    type: "string",
    alias: "c",
    description: "配置文件(相对/绝对)路径 支持yml和json",
    default: "./setting.yml",
    config: true,
  })
  config: string;

  @x.Group("全局配置")
  @x.Prompt({
    type: "select",
    choices: Object.entries(LogLevel).map(([message, name]: [string, string]) => ({
      message,
      name,
    }))
  })
  @x.Option({
    type: "string",
    choices: loglevelArr,
    description: "日志级别",
    default: isProduction ? LogLevel.Info : LogLevel.Debug
  })
  loglevel: LogLevel;

  version: string;
}
const [configObj, store] = setupYargs(yargs(hideBin(process.argv), rootDir), Main);
const { parser } = store;

export function setupMain<Namespaces extends {}>(
  namespaces?: { [K in keyof Namespaces]: new (...args: any[]) => Namespaces[K] }
) {
  const {
    configObj: { help, ...configObj },
    setupPrompt,
  } = store.append(namespaces);
  const logLevel = configObj.loglevel
  if (help) {
    parser.help(true).showHelp("log");
    process.exit(0);
  }
  const logger = createLogger("Main", {
    outputDir: isProduction && true,
    showTimestamps: isProduction,
    level: logLevel,
  });
  const config = setupConfig(configObj, configObj.config, { logger: () => logger });
  logger.info("当前运行环境: %s", isProduction ? "prod" : "dev");
  logger.info("日志级别: %s", logLevel);

  process.on("uncaughtException", function (err) {
    logger.error("Caught exception: " + err.message, err.stack, "Process");
    process.exit(1);
  });
  return [setupPrompt(), { config, logger }] as const;
}

export class BotConfig {
  @x.Group("El-Bot配置")
  @x.Prompt()
  @x.Option({
    type: "string",
    description: "主人账号",
  })
  master: number;

  @x.Group("El-Bot配置")
  @x.Prompt()
  @x.Option({
    type: "string",
    description: "el-bot配置路径",
    default: "./config/el",
  })
  config: string;

  @x.Group("El-Bot配置")
  @x.Prompt()
  @x.Option({
    type: "string",
    description: "登录账号",
  })
  account: number;
}

export { configObj, parser };
