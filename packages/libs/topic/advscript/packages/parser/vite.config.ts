import path from "path";
import { defineConfig, UserConfigFn } from "vite";
import dts from "vite-plugin-dts";
import { RawWorkspacePlugin } from "./OhmPlugin";
import { VitePluginStoryScript } from "./VitePluginStoryScript";

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
      include: ["chevrotain"],
      exclude: ["path", "zora-reporters", "@addLibs"],
    },
    server: {
      // host: Configuration.defaults.development.host,
      port: 3000, // Configuration.defaults.development.port,
      force: true,
    },
  };
}) as UserConfigFn;
