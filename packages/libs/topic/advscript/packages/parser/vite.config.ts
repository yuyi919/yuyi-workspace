import { defineConfig, UserConfigFn } from "vite";
import dts from "vite-plugin-dts";
import { RawWorkspacePlugin } from "./OhmPlugin";
import { VitePluginStoryScript } from "./VitePluginStoryScript";
import path from "path";
import createServer from "./src/test/server";
export default defineConfig(async ({ mode }) => {
  return {
    resolve: {
      alias: {
        "@yuyi919/zora": path.resolve("./src/test/zora-wrapper.ts"),
      },
    },
    plugins: [
      dts({ copyDtsFiles: true, insertTypesEntry: true }),
      VitePluginStoryScript(),
      RawWorkspacePlugin({ root: "./src" }),
    ],
    build: {
      assetsInlineLimit: 0,
      target: "es2020",
      // polyfillDynamicImport: false,

      // polyfillDynamicImport: false,
      minify: mode === "producton" ? "terser" : false,
      sourcemap: true,
      lib: {
        entry: path.resolve(__dirname, "src/index.ts"),
        fileName: "index",
        formats: ["cjs", "es"],
      },
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
        "vscode-uri",
        "chevrotain",
        "regexp-to-ast",
        "vscode-languageserver-types",
        "@codingame/monaco-jsonrpc",
      ],
      exclude: ["path", "zora-reporters", "@addLibs"],
    },
    server: {
      // host: Configuration.defaults.development.host,
      port: 3000, // Configuration.defaults.development.port,
      strictPort: true,
      force: true,
    },
  };
}) as UserConfigFn;
