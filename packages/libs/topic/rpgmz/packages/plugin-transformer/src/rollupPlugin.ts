import { ensureDir, readJsonSync, writeJSON } from "fs-extra";
import { defaults } from "lodash";
import { basename, join } from "path";
import ts from "typescript";
import { Cache, extractCode, transformToComment } from "./transformCode";
export function normlize(target: any) {
  if (target && ts.isTypeNode(target)) {
    return null;
  }
  if (target instanceof Object) {
    const r = target instanceof Array ? [] : {};
    for (const key in target) {
      r[key] = normlize(target[key]);
    }
    return r;
  }
  return target;
}

export const transformHook = async (code: string, id: string, cache: Cache) => {
  if (/\.ts$/.test(id) && code.indexOf("@x.") > -1) {
    const collectMap = extractCode(code);
    Object.assign(cache.collect, collectMap);
    cache.file_collect[id] = collectMap;
  }
  return `\r\n${code}`;
};

export function createPlugin(options?: {
  pluginNamesMap: Record<string, string>;
}): import("rollup").Plugin {
  const cache: Cache = {
    collect: {},
    file_collect: {},
  };
  let outputOption: import("rollup").OutputOptions;
  const { pluginNamesMap } = options || {};
  function getPluginName(fileName: string, prefix: string) {
    let baseName = basename(fileName, ".js").replace(/^plugin\./, "");
    let after = "";
    if (/^libs[0-9]+$/.test(baseName)) {
      after = baseName.replace("libs", "");
      baseName = "libs";
    }
    const pluginName = prefix + "_" + (pluginNamesMap[baseName] || baseName);
    return pluginName + after + ".js";
  }
  // const { generateBundle } = renameExtensions({
  //   include: [/src\/plugin\./],
  //   mappings: {
  //     'plugin.AdvCore.js': 'yuyi919_ADV核心.js'
  //   }
  // })
  const nameCache = {};
  const chunkFileNames = "plugin.libs.js";
  let libChunks = null;
  return {
    name: "rollup-plugin-extract-rmmz-plugin-desc",
    outputOptions({ ...option }) {
      return (outputOption = defaults(option, {
        chunkFileNames,
      }));
    },
    // generateBundle,
    generateBundle(_, bundle) {
      const files = Object.entries(bundle);
      const pkg = readJsonSync(join(process.cwd(), "./package.json"));
      const top = `//=============================================================================
// RPG Maker MZ - ${pkg.name} (v${pkg.version})
//=============================================================================\r\n`;
      for (const [key, file] of files) {
        const prefix = pkg.author;
        if (file.type === "chunk") {
          const pluginName = nameCache[key];
          if (nameCache[key]) {
            delete bundle[key];
            nameCache[key] = pluginName;
            const writeCode = `${top}${(file as any).code.replace(
              /('|")\.\/plugin\.libs([0-9]*)(\.js|)('|")/g,
              (name: string) => `"${getPluginName(name.replace(/^('|")|('|")$/g, ""), prefix)}"`
            )}`;
            const nextBundle = {
              ...file,
              code: writeCode,
              fileName: pluginName,
            };
            if (/^plugin\.libs([0-9]*)\.js$/.test(key)) {
              if (!libChunks) {
                libChunks = nextBundle;
              } else if (libChunks) {
                nextBundle.code = libChunks.code + nextBundle.code;
                console.log("generateBundle extend code");
              }
              nextBundle.fileName = nameCache[chunkFileNames];
              console.log("generateBundle", key, "=>", nextBundle.fileName);
            }
            bundle[pluginName] = nextBundle;
          }
        }
      }
    },
    renderChunk(code, { modules, fileName }) {
      if (modules) {
        libChunks = null;
        const pkg = readJsonSync(join(process.cwd(), "./package.json"));
        const prefix = pkg.author;
        const pluginName = getPluginName(fileName, prefix);
        nameCache[fileName] = pluginName;
        const files = Object.keys(modules);
        const collectMap = files
          ?.map((file) => cache.file_collect[file])
          .filter(Boolean)
          .reduce((r, collect) => Object.assign(r, collect), {});
        const texts = Object.values(transformToComment(collectMap, { cache, lang: "zh" }).result);
        // console.log(chunk, )

        const cacheDir = join(process.cwd(), "node_modules/.rmmz-plugin-transformer");
        ensureDir(cacheDir).then(() =>
          writeJSON(cacheDir + "/cache.json", normlize(cache), { spaces: 2 })
        );
        code = code.replace(`define([`, `loadEsModule("${pluginName}", [`);
        console.log("renderChunk", fileName, pluginName);
        return {
          code: texts.length > 0 ? `${texts.join("\r\n")}\r\n${code}` : `\r\n${code}`,
        };
      }
      return code;
    },
    transform(code, id) {
      return transformHook(code, id, cache);
    },
  };
}
