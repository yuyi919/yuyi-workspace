import path, { join } from "path";
import { escapeRegExp } from "lodash";
import builtins from "rollup-plugin-node-builtins";
import { defineConfig, UserConfigFn } from "vite";
import { defineMacroPlugin, vitePluginMacro } from "vite-plugin-macro";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import { RawWorkspacePlugin } from "../parser/OhmPlugin";
import { VitePluginStoryScript } from "../parser/VitePluginStoryScript";
import Provider from "./logger";
import MonacoEditorNlsPlugin, {
  esbuildPluginMonacoEditorNls,
  Languages,
} from "./vitePluginMonacoEditorNls";

const locale = Languages.zh_hans;
const macroPlugin = vitePluginMacro({
  typesPath: join(__dirname, "./macros.d.ts"),
  name: "macros",
  include: [new RegExp(escapeRegExp(join(__dirname, "src").replace(/\\/g, "/")) + "/.+\\.ts")],
  exclude: [/langium/, /languageclient/],
})
  .use(Provider)
  .toPlugin();

export default defineConfig(async ({ mode }) => {
  const isProd = mode === "production";
  const local = true;
  console.log("isProd:", isProd);
  return {
    resolve: {
      alias: {
        "@yuyi919/zora": path.resolve("./src/test/zora-wrapper.ts"),
        vscode: path.resolve("./libs/vscode-languageclient/vscode-compatibility.js"),
        "langium/lib": path.resolve("../langium/packages/langium/src"),
        langium: path.resolve("../langium/packages/langium/src/index.ts"),
        "@yuyi919/advscript-language-services": isProd
          ? path.resolve("./node_modules/@yuyi919/advscript-language-services")
          : path.resolve("../language-services/src/index.ts"),
        os: path.resolve("./src/os.ts"),
        "@yuyi919/advscript-parser": isProd
          ? path.resolve("./node_modules/@yuyi919/advscript-parser")
          : path.resolve("../parser/src/index.ts"),
      },
    },
    plugins: [
      monacoEditorPlugin(),
      // VitePluginLanguageServer(),
      VitePluginStoryScript(),
      RawWorkspacePlugin({ root: "./src" }),
      {
        name: "builtins",
        enforce: "pre",
        ...builtins({ crypto: true }),
      },
      MonacoEditorNlsPlugin({ locale }),
      macroPlugin,
    ],
    // esbuild: {
    //   loader: "ts",
    // },
    base: "/advscript-playground/",
    build: {
      assetsInlineLimit: 0,
      target: "esnext",
      // polyfillDynamicImport: false,

      // polyfillDynamicImport: false,
      minify: isProd ? "terser" : false,
      commonjsOptions: {
        include: [/node_modules/, /vscode/],
        exclude: ["loader.js"],
      },
      outDir: "./dist/advscript-playground",
      rollupOptions: {
        plugins: [
          {
            name: "builtins",
            enforce: "pre",
            ...builtins({ crypto: true }),
          },
        ],
        output: {
          manualChunks: {
            // editor: ["monaco-editor"],
            parser: ["chevrotain", "@yuyi919/advscript-parser"],
            lsp: ["@yuyi919/advscript-language-services"],
            vsc: ["./libs/vscode-languageclient/vscode-compatibility.js"],
          },
          chunkFileNames: (chunk) => {
            // console.log(chunk.isDynamicEntry, chunk.name)
            return `assets/${chunk.name === "_" ? "workspaces" : chunk.name}.[hash].js`;
          },
        },
        // external: ["os", "path"],
      },
      // lib: {
      //   entry: path.resolve(__dirname, "src/index.ts"),
      //   fileName: "index",
      //   formats: ["cjs", "es"],
      // },
      // lib: {
      //   entry: require.resolve("ohm-js/dist/ohm.min.js"),
      //   fileName: "index",
      //   formats: ["cjs", "es"],
      // },
      // outDir: "./parser"
      // rollupOptions: {
      //   external: ["ohm-js"],
      // },
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          // macroPlugin as any,
          esbuildPluginMonacoEditorNls({
            locale,
          }),
        ],
      },
      include: [
        "monaco-textmate",
        "monaco-editor-textmate",
        "vscode-jsonrpc",
        "vscode-languageclient",
        "vscode-languageserver",
        "vscode-languageserver-textdocument",
        "reconnecting-websocket",
        "monaco-editor/esm/vs/language/typescript/ts.worker.js",
        "monaco-editor/esm/vs/editor/editor.api.js",
        "vscode-languageclient/lib/common/client",
        "vscode-languageserver-protocol/lib/common/utils/is",
        "vscode-uri",
        "chevrotain",
        "regexp-to-ast",
        "@codingame/monaco-jsonrpc",
        "vscode-languageserver-types",
      ],
      exclude: [
        "vscode",
        "path",
        "zora-reporters",
        "monaco-editor",
        "monaco-editor-core",
        "@addLibs",
        "@yuyi919/advscript-parser",
        "@yuyi919/advscript-language-services",
      ],
    },
    server: {
      // host: Configuration.defaults.development.host,
      port: 3000, // Configuration.defaults.development.port,
      fs: {
        strict: false,
      },
    },
  };
}) as UserConfigFn;
