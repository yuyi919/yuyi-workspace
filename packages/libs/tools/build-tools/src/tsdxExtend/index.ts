/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import resolve from "@rollup/plugin-node-resolve";
import fs from "fs-extra";
import path from "path";
import { RollupOptions, RollupWarning, OutputOptions } from "rollup";
import commonjs, { RollupCommonJSOptions } from "@rollup/plugin-commonjs";
import replacer from "rollup-plugin-replace";
import type { RollupBabelInputPluginOptions } from "@rollup/plugin-babel";
import RollupPluginTypescript2 from "rollup-plugin-typescript2";
import * as Logger from "tsdx/dist/output";
import { external } from "tsdx/dist/utils";
import alias, { RollupAliasOptions } from "@rollup/plugin-alias";
import { castArray } from "lodash";
import { createExtractErrorsPlugins } from "./extractErrors";
import * as BabelConfigPreset from "./preset-babel";

// export function createPluginsEsBuildForVue(options: Options = {}) {
//   const vueJsx = require('rollup-plugin-vue-jsx-compat');
//   const esbuild = require('rollup-plugin-esbuild');
//   return [
//     vueJsx({
//       jsxCompatPath: require
//         .resolve('rollup-plugin-vue-jsx-compat/src/vue-jsx-compat.js')
//         .replace(/\\/g, '\\\\'),
//     }),
//     esbuild({
//       jsxFactory: 'vueJsxCompat',
//       ...options,
//       minify: false,
//     }),
//   ];
// }
export function createPluginVue() {
  return require("rollup-plugin-vue")({
    // ...rollupPluginVueOptions,
    // templatePreprocessOptions: {
    //     ...vueTemplatePreprocessOptions,
    //     pug: {
    //         doctype: 'html',
    //         ...(vueTemplatePreprocessOptions && vueTemplatePreprocessOptions.pug)
    //     }
    // },
    // transformAssetUrls: vueTransformAssetUrls,
    // postcssOptions,
    // postcssPlugins,
    // preprocessStyles: true,
    // preprocessOptions: {}, //cssPreprocessOptions,
    // // preprocessCustomRequire: (id) => require(utils_1.resolveFrom(root, id)),
    // compilerOptions: {}, // vueCompilerOptions,
    // cssModulesOptions: {
    //   localsConvention: 'camelCase',
    //   // generateScopedName: (local, filename) => `${local}_${hash_sum_1.default(filename)}`,
    //   // ...cssModuleOptions,
    //   // ...(rollupPluginVueOptions && rollupPluginVueOptions.cssModulesOptions)
    // },
    // customBlocks: Object.keys(vueCustomBlockTransforms)
  });
}
export type TsdxOptions = {
  format: "cjs" | "esm";
  target?: "node" | string;
  extractErrors?: boolean;
  tsconfig?: string;
  name: string;
  errorMapFilePath?: string;
  input: string;
  minify?: boolean;
};
export type ExtendConfig = RollupOptions & {
  preset?: "ts" | "vue3" | "babel-ts" | "ts-only";
  /** @default "all" */
  transpiler?: "all" | "ts" | "babel";
  banner?: string;
  babelHelpers?: RollupBabelInputPluginOptions["babelHelpers"];
  bundleDeps?: (string | RegExp)[];
  excludeDundleDeps?: (string | RegExp)[];
  extractErrors?: boolean | string;
  overwriteTsConfig?: any;
  output?: OutputOptions;
  alias?: RollupAliasOptions;
  commonjs?: RollupCommonJSOptions;
};
/**
 * ?????????????????????tsdx??????
 */
export function extendTsdxConfig(
  configure:
    | ExtendConfig
    | ((config: RollupOptions, options: TsdxOptions, outputNum: number) => ExtendConfig) = {}
) {
  let num = 0;
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rollup(config: RollupOptions, options: TsdxOptions, outputNum: number = num++) {
      const extendConfig =
        configure instanceof Function ? configure(config, options, outputNum) : configure;
      const {
        output,
        preset,
        plugins: prePlugins,
        bundleDeps,
        excludeDundleDeps = [],
        babelHelpers,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        transpiler = "all",
        extractErrors,
        overwriteTsConfig,
        commonjs: commonjsOptions,
        alias: aliasOptions,
        ...next
      } = extendConfig;
      if (preset && !["ts", "vue3", "babel-ts", "ts-only"].includes(preset)) {
        Logger.error(`preset [${preset}] is invalid!`);
      } else {
        Logger.info("use preset: " + (extendConfig.preset || "default"));
      }
      let filter = bundleDeps || [];
      filter.length > 0 && Logger.info("external resolve modules: " + filter.join(", "));

      filter = Array.from(
        new Set(["babel-plugin-transform-async-to-promises/helpers", "tslib", ...filter])
      );
      const excludeFilter = Array.from(new Set(excludeDundleDeps || []));
      excludeFilter.length > 0 &&
        Logger.info("exclude resolve modules: " + excludeFilter.join(", "));
      // console.log(config.plugins.map(p => p && p.name))
      const ignoreWarnHooks = [] as (string | ((warning: RollupWarning) => boolean))[];
      // Logger.info(outputNum);
      process.env.NODE_TSDX_FORMAT = options.format;
      const NODE_ENV = JSON.stringify(options.minify ? "production" : "development");
      console.log("process.env.NODE_ENV", NODE_ENV);
      const { plugins = [] } = config;
      if (preset === "vue3") {
        plugins.unshift(createPluginVue());
      }
      // console.log(outputNum, 'format:', options.format, options)
      config.plugins = plugins.reduce((list, plugin) => {
        if (!plugin) return list;
        plugin = BabelConfigPreset.pluginReplacer(extendConfig, options, plugin);
        if (!plugin) return list;
        if (plugin.name === "rpt2") {
          return list.concat(
            preset === "vue3" || preset === "babel-ts"
              ? // options.format === 'esm'
                //   ? [
                //       // require('@wessberg/rollup-plugin-ts')({
                //       //   tsconfig: options.tsconfig,
                //       //   browserslist: false,
                //       //   transpileOnly: true,
                //       //   emitDeclarationOnly: true,
                //       //   transpiler: 'babel',
                //       //   hook: {
                //       //     outputPath: (path, kind) => {
                //       //       if (kind === 'declaration' || kind === 'declarationMap') {
                //       //         const nameParttern = (config.output as OutputOptions).file.match(
                //       //           /dist\/(.*?)\.js/
                //       //         );
                //       //         if (nameParttern && nameParttern[1])
                //       //           path = path.replace(nameParttern[1], 'index')
                //       //       }
                //       //       return path;
                //       //     },
                //       //   },
                //       // }),
                //     ]
                //   :
                []
              : //createPluginsEsBuildForVue()
                (Logger.info("use 'rollup-plugin-typescript2'"),
                [
                  RollupPluginTypescript2({
                    // typescript: 'typescript',
                    tsconfig: options.tsconfig,
                    tsconfigDefaults: {
                      exclude: [
                        // all TS test files, regardless whether co-located or in test/ etc
                        "**/*.spec.ts",
                        "**/*.test.ts",
                        "**/*.spec.tsx",
                        "**/*.test.tsx",
                        // TS defaults below
                        "node_modules",
                        "bower_components",
                        "jspm_packages",
                        "**/dist",
                      ],
                      compilerOptions: {
                        sourceMap: true,
                        declaration: true,
                      },
                    },
                    tsconfigOverride: {
                      compilerOptions: Object.assign(
                        {
                          // TS -> esnext, then leave the rest to babel-preset-env
                          target: "esnext",
                          rootDir: "./src",
                          emitDeclarationOnly: false,
                        },
                        outputNum > 0 ? { declaration: false, declarationMap: false } : {},
                        overwriteTsConfig
                      ),
                    },
                    check: false,
                    useTsconfigDeclarationDir: false,
                  }),
                ])
          );
        }
        if (plugin.name === "node-resolve") {
          return list.concat([
            resolve({
              extensions: [".mjs", ".js", ".json", ".node", ".ts", ".tsx", ".vue"],
              mainFields: [
                // 'esnext',
                "module",
                "main",
                options.target !== "node" ? "browser" : undefined,
              ].filter(Boolean),
            }),
          ]);
        }
        if (plugin.name === "commonjs") {
          return list.concat([
            commonjs(
              commonjsOptions ||
                {
                  // t
                }
            ),
          ]);
        }
        return list.concat([plugin]);
      }, []);
      prePlugins && config.plugins.unshift(...prePlugins);
      config.plugins.unshift(
        replacer({
          delimiters: ["", ""],
          values: {
            "process.env.NODE_ENV": NODE_ENV,
          },
        }),
        replacer({
          delimiters: ["", ""],
          values: {
            [`/src/`]: (id) => path.relative(path.dirname(id), options.input).replace(/\\/, "/"),
            [`require('../package.json')`]: (id) => {
              const json = fs.readJsonSync(path.join(path.dirname(id), "../package.json"));
              // console.debug('get', id, path.join(path.dirname(id), '../package.json'))
              return JSON.stringify(json); //`import { version } from '../package.json'`
            },
          },
        })
      );
      if (aliasOptions) {
        config.plugins.unshift(alias(aliasOptions));
      }
      if (output) {
        castArray(config.output).forEach((source) => {
          const { globals, ...other } = output;
          Object.assign(source.globals, globals);
          Object.assign(source, other);
        });
      }
      if (extractErrors) {
        outputNum === 0 && Logger.info("use ExtractErrors");
        const ExtractErrorPlugin = createExtractErrorsPlugins(extractErrors, options);
        config.plugins.unshift(ExtractErrorPlugin);
        ignoreWarnHooks.push(ExtractErrorPlugin.name);
      }
      // console.log({
      //   input: next.input,
      //   output: config.output
      // })
      // console.log(config.output)
      return {
        ...config,
        onwarn(warn, defaultOnWarn) {
          if (warn.plugin === "vueJsx" && warn.code === "SOURCEMAP_BROKEN") {
            return;
          }
          if (ignoreWarnHooks.some((i) => (typeof i === "string" ? i === warn.plugin : i(warn))))
            return;
          defaultOnWarn(warn);
        },
        external: (id) => {
          if (excludeFilter.some((s) => (s instanceof RegExp ? s.test(id) : id.indexOf(s) > -1))) {
            return true;
          }
          if (filter.some((s) => (s instanceof RegExp ? s.test(id) : id.indexOf(s) > -1))) {
            return false;
          }
          return false || external(id);
        },
        ...next,
      } as RollupOptions;
    },
  };
}
