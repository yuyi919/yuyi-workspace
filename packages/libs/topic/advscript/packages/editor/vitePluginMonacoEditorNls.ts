/* eslint-disable no-useless-escape */
import fs from "fs";
import path from "path";
import { Plugin } from "vite";
import MagicString from "magic-string";

export enum Languages {
  bg = "bg",
  cs = "cs",
  de = "de",
  en_gb = "en-gb",
  es = "es",
  fr = "fr",
  hu = "hu",
  id = "id",
  it = "it",
  ja = "ja",
  ko = "ko",
  nl = "nl",
  pl = "pl",
  ps = "ps",
  pt_br = "pt-br",
  ru = "ru",
  tr = "tr",
  uk = "uk",
  zh_hans = "zh-hans",
  zh_hant = "zh-hant",
}

export interface Options {
  locale: Languages;
}

/**
 * 在vite中dev模式下会使用esbuild对node_modules进行预编译，导致找不到映射表中的filepath，
 * 需要在预编译之前进行替换
 * @param options 替换语言包
 * @returns
 */
export function esbuildPluginMonacoEditorNls(options: Options = { locale: Languages.en_gb }) {
  // const CURRENT_LOCALE_DATA = getLocalizeMapping(options.locale);

  return {
    name: "esbuild-plugin-monaco-editor-nls",
    setup(build) {
      build.onLoad({ filter: /esm\/vs\/nls\.js/ }, async () => {
        return {
          contents: getLocalizeCode(),
          loader: "js",
        };
      });

      build.onLoad({ filter: /monaco-editor[\\\/]esm[\\\/]vs.+\.js/ }, async (args) => {
        return {
          contents: transformLocalizeFuncCode(args.path),
          loader: "js",
        };
      });
    },
  };
}

/**
 * 使用了monaco-editor-nls的语言映射包，把原始localize(data, message)的方法，替换成了localize(path, data, defaultMessage)
 * vite build 模式下，使用rollup处理
 * @param options 替换语言包
 * @returns
 */
export default function (options: Options = { locale: Languages.en_gb }): Plugin {
  // const CURRENT_LOCALE_DATA = getLocalizeMapping(options.locale);

  return {
    name: "rollup-plugin-monaco-editor-nls",

    enforce: "pre",

    load(filepath) {
      if (/esm\/vs\/nls\.js/.test(filepath)) {
        const code = getLocalizeCode();
        return code;
      }
    },
    transform(code, filepath) {
      if (
        /monaco-editor[\\\/]esm[\\\/]vs.+\.js/.test(filepath) &&
        !/esm\/vs\/.*nls\.js/.test(filepath)
      ) {
        const re = /(?:monaco-editor\/esm\/)(.+)(?=\.js)/;
        if (re.exec(filepath) && code.includes("localize(")) {
          const path = RegExp.$1;
          code = code.replace(/localize\(/g, `localize('${path}', `);
          return {
            code: code,
            /** 使用magic-string 生成 source map */
            map: new MagicString(code).generateMap({
              source: filepath,
              includeContent: true,
              hires: true
            }),
          };
        }
      }
    },
  };
}

/**
 * 替换调用方法接口参数，替换成相应语言包语言
 * @param filepath 路径
 * @param CURRENT_LOCALE_DATA 替换规则
 * @returns
 */
function transformLocalizeFuncCode(filepath: string) {
  let code = fs.readFileSync(filepath, "utf8");
  const re = /(?:monaco-editor\/esm\/)(.+)(?=\.js)/;
  if (re.exec(filepath)) {
    const path = RegExp.$1;
    code = code.replace(/localize\(/g, `localize('${path}', `);
  }
  return code;
}

/**
 * 获取语言包
 * @param locale 语言
 * @returns
 */
// function getLocalizeMapping(locale: Languages) {
//   const locale_data_path = path.join(__dirname, `./locale/${locale}.json`);
//   return fs.readFileSync(locale_data_path) as unknown as string;
// }

/**
 * 替换代码
 * @param CURRENT_LOCALE_DATA 语言包
 * @returns
 */
function getLocalizeCode() {
  return `
        function _format(message, args) {
            var result;
            if (args.length === 0) {
                result = message;
            } else {
                result = String(message).replace(/\\{(\\d+)\\}/g, (match, rest) => {
                    var index = rest[0];
                    return args[index] ?? match;
                });
            }
            return result;
        }
        export function localize(path, data, defaultMessage, ...args) {
            var key = typeof data === 'object' ? data.key : data;
            var locale = globalThis.MonacoEnvironment.locale || {};
            var message = locale[path]?.[key] ?? defaultMessage;
            if (!message) {
                message = defaultMessage;
            }
            return _format(message, args);
        }
    `;
}
