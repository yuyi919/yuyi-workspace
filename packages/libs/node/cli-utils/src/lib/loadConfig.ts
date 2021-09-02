import { load, dump } from "js-yaml";
import { dirname } from "path";
import { join } from "path";
import { readFileSync, ensureDirSync, writeJsonSync, writeFileSync } from "fs-extra";
import { get as lodashGet } from "lodash";
import { memoize } from "lodash";
import { isAbsolute, parse, relative } from "path";
import { rootDir } from "./env";
import { Types } from "@yuyi919/shared-types";

export function loadConfig(filePath: string) {
  return load(readFileSync(filePath).toString(), { json: /\.json$/.test(filePath) });
}

export function saveConfig(filePath: string, object: any) {
  const isJson = /\.json$/.test(filePath);
  ensureDirSync(dirname(filePath));
  return isJson
    ? writeJsonSync(filePath, object instanceof Object ? object : {})
    : writeFileSync(
        filePath,
        dump(object, {
          indent: 2,
          lineWidth: Infinity,
        })
      );
}

export class ConfigManager<T, Keys extends string> {
  loadConfig = loadConfig;
  saveConfig = saveConfig;
  constructor(
    private configObj: T,
    public path: string,
    public options?: {
      logger: any;
    }
  ) {}

  get<T>(key: Keys): T {
    return lodashGet(this.configObj as any, key);
  }

  getFileName(fileName: string, extName: string) {
    return fileName.endsWith(extName)
      ? fileName
      : fileName + (extName.startsWith(".") ? "" : ".") + extName;
  }
  getPath(key: string, fileName: string, extName: string): string;
  getPath(key: string): string;
  getPath(key: string, fileName: string = "", extName: string = ".json"): string {
    const value = (lodashGet(this.configObj, key) || "") as string;
    if (fileName || extName) {
      return value.endsWith(".yml") || value.endsWith(".json")
        ? value
        : fileName !== void 0 && value.endsWith(fileName)
        ? this.getFileName(value, extName)
        : join(value, this.getFileName(fileName, extName));
    }
    return value;
  }

  private configPath = memoize((path: string) =>
    parse(isAbsolute(path) ? relative(rootDir, path) : path)
  );
  /**
   * 配置项总目录
   * @remark 相对路径
   */
  configDir(filePath: string = this.path) {
    return this.configPath(filePath).dir;
  }
  /**
   * 配置文件名称
   * @remark 如果不传递后缀，补全为*.json
   */
  configFileName(filePath: string = this.path) {
    const parsed = this.configPath(filePath);
    return parsed.ext ? parsed.base : `${parsed.name}.json`;
  }

  util = new ConfigUtils(this);
}
export class ConfigUtils {
  constructor(private root: ConfigManager<any, any>) {}

  resolveFile(filePath: string, debugName?: boolean | string) {
    const resolve = join(rootDir, filePath);
    debugName &&
      this.root.options
        ?.logger()
        .debug(
          `Resolve ${typeof debugName === "string" ? debugName : "config"} from "%s"`,
          resolve
        );
    return resolve;
  }

  loadFile(filePath: string, debugName?: boolean | string, printFile?: boolean) {
    const resolve = this.resolveFile(filePath);
    const configObj = loadConfig(filePath);
    this.root.options
      ?.logger()
      .success(
        `Load ${typeof debugName === "string" ? debugName : "config"} (%s)${
          printFile ? "" : " %s!"
        }`,
        "./" + relative(rootDir, resolve).replace(/\\/g, "/"),
        printFile ? configObj : "success"
      );
    return configObj;
  }

  resolveConfig(
    dir = this.root.configDir(),
    fileName = this.root.configFileName(),
    debugName?: boolean | string
  ) {
    return this.resolveFile(join(dir, fileName), debugName);
  }

  loadFileConfigs(
    dir = this.root.configDir(),
    fileName = this.root.configFileName(),
    debugName?: boolean | string,
    printFile?: boolean
  ) {
    return this.loadFile(join(dir, fileName), debugName, printFile);
  }
}

export function setupConfig<T, Keys extends Types.Object.Paths<T, 2>>(
  configObj: T,
  path: string,
  options?: {
    logger: any;
  }
) {
  return new ConfigManager<T, Keys>(configObj, path, options);
}

// export
// export { configDir, configFileName } from "./configPath";
// export { loadConfig, saveConfig } from "@yuyi919/cli-utils";
//
