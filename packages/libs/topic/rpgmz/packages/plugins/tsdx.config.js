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
  commonjs: {
    exclude: ["@inlet/react-pixi/animated", "@lazarv/wasm-yoga"],
  },
  alias: {
    entries: [
      { find: "@lazarv/wasm-yoga", replacement: require.resolve("./fix/yoga") },
      {
        find: /^@inlet\/react-pixi\/animated$/,
        replacement: require.resolve("@inlet/react-pixi/animated"),
      },
      // {
      //   find: /^react$/,
      //   replacement: require.resolve("react/cjs/react.production.min.js"),
      // },
      // {
      //   find: /^react-dom$/,
      //   replacement: require.resolve("react-dom/cjs/react-dom.production.min.js"),
      // },
      //   replacement: require.resolve("@inlet/react-pixi/animated"),
      // },
    ],
  },
  preset: "ts-only",
  bundleDeps: [
    /babel/,
    // "tslib",
    "path",
    // "@yuyi919/rpgmz-plugin-transformer",
    // // "class-transformer",
    // "reflect-metadata",
    "react",
    "object-assign",
    "scheduler",
    "@lazarv/wasm-yoga",
    "pixi-flex-layout",
    "lodash-es",
  ],
  excludeDundleDeps: [],
  extractErrors: undefined,
  babelHelpers: "inline",
  input: ["./src/plugin.*.ts"],
  output: {
    file: false,
    dir: "dist",
    format: "amd",
    exports: "auto",
    hoistTransitiveImports: false,
    esModule: false,
    // compact: true,
    // strict: false,
    freeze: false,
    sourcemap: true,
    globals: {
      react: "React",
      "pixi.js": "PIXI",
      // "@yuyi919/rpgmz-core": "RPGMZ",
      // Core: "globalThis",
    },
  },
  treeshake: true,
  // shimMissingExports: true,
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
    target: "es2017",
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
