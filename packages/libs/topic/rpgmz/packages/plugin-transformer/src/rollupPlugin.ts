import { ensureDir, readJsonSync, writeJSON } from "fs-extra";
import { defaults } from "lodash";
import MagicString from "magic-string";
import { basename, join } from "path";
import { OutputChunk } from "rollup";
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
  const str = new MagicString(`\r\n${code}`);
  return {
    code: str.toString(),
    map: str.generateMap({ hires: true }),
  };
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
    // console.log(fileName, "=>", pluginName + after + ".js");
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
  const libChunks: OutputChunk[] = [];
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
          // console.log(key)
          if (nameCache[key]) {
            delete bundle[key];
            nameCache[key] = pluginName;
            // console.log("generateBundle", key);
            const writeCode = `${top}${file.code.replace(
              /('|")\.\/plugin\.libs([0-9]*)(\.js|)('|")/g,
              (name: string) => {
                return `"${getPluginName(name.replace(/^('|")|('|")$/g, ""), prefix)}"`;
              }
            )}`;
            const next = file;
            // console.log(key, pluginName);
            if (/^plugin\.libs([0-9]*)\.js$/.test(key)) {
              console.log("generateBundle", key, "=>", nameCache[chunkFileNames]);
              libChunks.push({
                ...next,
                code: writeCode,
              });
              //  else if (libChunks) {
              //   nextBundle.code = libChunks.code + nextBundle.code;
              // }
              // nextBundle.fileName = nameCache[chunkFileNames];
            } else {
              const nextBundle = {
                ...next,
                code: writeCode,
                fileName: pluginName,
              };
              bundle[pluginName] = nextBundle;
            }
          }
        }
      }
      if (libChunks && libChunks.length > 0) {
        // writeJSON(
        //   join(__dirname, "test.json"),
        //   libChunks.map(({ code, ...other }) => other)
        // );
        bundle[nameCache[chunkFileNames]] =
          libChunks.length > 1
            ? libChunks.reduce((r, chunk) => ({
                fileName: nameCache[chunkFileNames],
                name: nameCache[chunkFileNames],
                modules: { ...r.modules, ...chunk.modules },
                exports: [...r.exports, ...chunk.exports],
                imports: [...r.imports, ...chunk.imports],
                importedBindings: { ...r.importedBindings, ...chunk.importedBindings },
                dynamicImports: [...r.dynamicImports, ...chunk.dynamicImports],
                code: r.code + "\n;" + chunk.code,
                facadeModuleId: null,
                isEntry: false,
                type: "chunk",
                implicitlyLoadedBefore: [],
                referencedFiles: [],
                isImplicitEntry: false,
                isDynamicEntry: false,
              }))
            : {
                ...libChunks[0],
                fileName: nameCache[chunkFileNames],
              };
        console.log("finished!");
        // libChunks.code = libCodes.join("\n");
      }
    },
    renderChunk(code, { modules, fileName, map }, options) {
      // console.log("renderChunk", fileName);
      if (modules) {
        // libChunks = null;
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
        // console.log(code)

        const cacheDir = join(process.cwd(), "node_modules/.cache/rpgmz-plugin-transformer");
        ensureDir(cacheDir).then(() =>
          writeJSON(cacheDir + "/cache.json", normlize(cache), { spaces: 2 })
        );

        const banner = texts.length > 0 ? `${texts.join("\r\n")}\r\n` : `\r\n`;
        if (!options.sourcemap) {
          return `${banner}\r\n${code.replace(`define([`, `loadEsModule("${pluginName}", [`)}`;
        }
        code = code.replace(`define([`, `loadEsModule("${pluginName}", [`);
        const magicString = new MagicString(code);
        magicString.prepend(banner);
        // console.log("renderChunk", fileName, pluginName);
        return {
          code: magicString.toString(),
          map: magicString.generateMap({ hires: true }),
        };
      }
      return options.sourcemap ? { code, map } : code;
    },
    transform(code, id) {
      return transformHook(code, id, cache);
    },
  };
}
