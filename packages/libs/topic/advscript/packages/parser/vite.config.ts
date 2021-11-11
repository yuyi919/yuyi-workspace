import { defineConfig, UserConfigFn } from "vite";
import dts from "vite-plugin-dts";
import plugin, { RawPlugin } from "./OhmPlugin";
import path from "path";
import createServer from "./src/test/server";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
export default defineConfig(async ({ mode }) => {
  return {
    resolve: {
      alias: {
        "@adv.ohm": path.resolve("./ohm/adv.ohm"),
        "@expression.ohm": path.resolve("./ohm/expression.ohm"),
        "ohm-js": path.resolve("./node_modules/ohm-js/src/main.js"),
        "@yuyi919/zora": path.resolve("./src/test/zora-wrapper.ts"),
        vscode: path.resolve("./node_modules/@codingame/monaco-languageclient/lib/vscode-compatibility.js"),
        "@codingame/monaco-languageclient": path.resolve("./node_modules/@codingame/monaco-languageclient/src/index.ts")
      },
    },
    plugins: [
      dts({ copyDtsFiles: true, insertTypesEntry: true }),
      monacoEditorPlugin(),
      plugin(),
      RawPlugin({ root: "./src" }),
      {
        name: "zaro-vite",
        apply: "serve",
        enforce: "post",
        async configureServer(server) {
          await createServer(server);
        },
      },
    ],
    // esbuild: {
    //   loader: "ts",
    // },
    build: {
      // assetsInlineLimit: 0,
      // cssCodeSplit: false,
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
      // rollupOptions: {
      //   external: ["ohm-js"],
      // },
    },
    optimizeDeps: {
      include: [
        "ohm-js",
        "monaco-textmate",
        "monaco-editor-textmate"
      ],
      exclude: ["path", "zora-reporters", "@addLibs", "vscode", "@codingame/monaco-languageclient"],
    },
    server: {
      // host: Configuration.defaults.development.host,
      port: 3000, // Configuration.defaults.development.port,
      strictPort: true,
      force: true,
    },
  };
}) as UserConfigFn;
