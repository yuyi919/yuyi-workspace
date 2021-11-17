import { RawWorkspacePlugin } from "../parser/OhmPlugin";
import { VitePluginStoryScript } from "../parser/VitePluginStoryScript";
import path from "path";
import { defineConfig, UserConfigFn } from "vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

export default defineConfig(async ({ mode }) => {
  return {
    resolve: {
      alias: {
        "@yuyi919/zora": path.resolve("./src/test/zora-wrapper.ts"),
        vscode: path.resolve("./src/lib/languageclient/vscode-compatibility.ts"),
        "langium/lib": path.resolve("./src/service/langium-compatibility/"),
        langium: path.resolve("./src/service/langium-compatibility/index.ts"),
        "@yuyi919/advscript-parser": path.resolve("../parser/src/index.ts"),
      },
    },
    plugins: [monacoEditorPlugin(), VitePluginStoryScript(), RawWorkspacePlugin({ root: "./src" })],
    // esbuild: {
    //   loader: "ts",
    // },
    build: {
      assetsInlineLimit: 0,
      target: "es2020",
      // polyfillDynamicImport: false,

      // polyfillDynamicImport: false,
      minify: mode === "producton" ? "terser" : false,
      sourcemap: true,
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
        "vscode",
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
      exclude: ["path", "zora-reporters", "@addLibs", "@yuyi919/advscript-parser"],
    },
    server: {
      // host: Configuration.defaults.development.host,
      port: 3000, // Configuration.defaults.development.port,
      strictPort: true,
      force: true,
    },
  };
}) as UserConfigFn;
