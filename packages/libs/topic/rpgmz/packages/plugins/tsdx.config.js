const { extendTsdxConfig } = require("@yuyi919/build-tools");
const multiInput = require("rollup-plugin-multi-input").default;
const builtins = require("rollup-plugin-node-polyfills");
const path = require("path");
const { createPlugin } = require("@yuyi919/rpgmz-plugin-transformer/dist/rollupPlugin");

module.exports = extendTsdxConfig({
  // preset: "babel-ts",
  // bundleDeps: [
  //   "regenerator-runtime",
  //   "path",
  //   /babel/,
  // ],
  preset: "ts",
  bundleDeps: [
    /babel/,
    "tslib",
    "path",
    // "@yuyi919/rpgmz-plugin-transformer",
    // // "class-transformer",
    // "reflect-metadata",
    "lodash-es"
  ],
  excludeDundleDeps: [],
  extractErrors: undefined,
  babelHelpers: "inline",
  input: ["./src/plugin.*.ts"],
  output: {
    file: false,
    dir: "dist",
    format: "amd",
    exports: "named",
    hoistTransitiveImports: true,
    esModule: false,
    // compact: true,
    freeze: false,
    sourcemap: false,
    globals: {
      RMMZ: "globalThis",
      Core: "globalThis",
    },
  },
  shimMissingExports: true,
  experimentalOptimizeChunks: true,
  manualChunks: false,
  // manualChunks(id) {
  //   const name = path.basename(id);
  //   console.log(id, name)
  //   return /src(.+?)/.test(id) ? 'plugin.libs' : name;
  // },
  overwriteTsConfig: {
    declaration: false,
    declarationMap: false,
    removeComments: false,
    target: "es5",
  },
  plugins: [
    multiInput({
      transformOutputPath: (output, input) => {
        const name = path.basename(output);
        return /^plugin\./.test(name) ? output : `plugin.libs`;
      },
    }),
    builtins(),
    createPlugin({
      pluginNamesMap: {
        BattleSeqExtra: "VisuMZ战斗序列增强",
        Core: "PluginManager",
        AdvCore: "ADV核心",
        ScreenZoom: "镜头缩放效果",
        NVMaker: "视觉小说对白",
        MsgExtra: "增强文本控制符",
        libs: "Preset",
      },
    }),
    // {
    //   transform(code, id) {
    //     const name = path.basename(id);
    //     if (/^plugin\./.test(name)) {
    //       code = prependHeader(pkg) + '\n' + code + '//123';
    //       console.error('banner', name, code);
    //       return { map: null, code };
    //     }
    //     return code;
    //   },
    // },
  ],
});
