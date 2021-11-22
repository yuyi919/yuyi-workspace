import { RawWorkspacePlugin } from "../parser/OhmPlugin";
import { VitePluginStoryScript } from "../parser/VitePluginStoryScript";
import path from "path";
import { defineConfig, UserConfigFn } from "vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import { VitePluginLanguageServer } from "./VitePluginLanguageServer";
import builtins from "rollup-plugin-node-builtins";
export default defineConfig(async ({ mode }) => {
  const isProd = mode === "production";
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
        "@yuyi919/advscript-parser": isProd
          ? path.resolve("./node_modules/@yuyi919/advscript-parser")
          : path.resolve("../parser/src/index.ts"),
      },
    },
    plugins: [
      monacoEditorPlugin(),
      VitePluginLanguageServer(),
      VitePluginStoryScript(),
      RawWorkspacePlugin({ root: "./src" }),
      {
        name: "builtins",
        enforce: "pre",
        ...builtins({ crypto: true }),
      },
    ],
    // esbuild: {
    //   loader: "ts",
    // },
    build: {
      assetsInlineLimit: 0,
      target: "es2020",
      // polyfillDynamicImport: false,

      // polyfillDynamicImport: false,
      minify: isProd ? "terser" : false,
      commonjsOptions: {
        include: [/node_modules/, /vscode/],
      },
      rollupOptions: {
        // output: {
        //   manualChunks(id) {
        //     if (id.indexOf("monaco-editor") > -1) {
        //       return "monaco-core";
        //     }
        //     if (id.indexOf("/src/") > -1) {
        //       return "index";
        //     }
        //   },
        // },
        external: ["os", "path"],
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
      include: [
        "monaco-textmate",
        "monaco-editor-textmate",
        "monaco-editor-core",
        "vscode-jsonrpc",
        "vscode-languageclient",
        "vscode-languageserver",
        "vscode-languageserver-textdocument",
        "reconnecting-websocket",
        "vscode-languageclient/lib/common/client",
        "vscode-languageserver-protocol/lib/common/utils/is",
        "monaco-editor/esm/vs/editor/editor.worker",
        "vscode-uri",
        "chevrotain",
        "regexp-to-ast",
        "vscode-languageserver-types",
        "@codingame/monaco-jsonrpc",
      ],
      exclude: ["vscode", "path", "zora-reporters", "@addLibs", "@yuyi919/advscript-parser"],
    },
    server: {
      // host: Configuration.defaults.development.host,
      port: 3000, // Configuration.defaults.development.port,
      force: true,
      fs: {
        strict: false,
      },
    },
  };
}) as UserConfigFn;
