import { defineConfig, UserConfigFn } from "vite";
import dts from "vite-plugin-dts";
import plugin from "@yuyi919/advscript-vite-plugin";
import path from "path";

export default defineConfig(async ({ mode }) => {
  return {
    resolve: {
      alias: {
        "@adv.ohm": path.resolve("./ohm/adv.ohm"),
        "@expression.ohm": path.resolve("./ohm/expression.ohm"),
        "ohm-js": path.resolve("./node_modules/ohm-js/src/main.js"),
      },
    },
    plugins: [dts({ copyDtsFiles: true, insertTypesEntry: true }), plugin()],
    esbuild: {
      loader: "ts"
    },
    build: {
      // assetsInlineLimit: 0,
      // cssCodeSplit: false,
      target: "es2017",
      polyfillDynamicImport: false,

      // polyfillDynamicImport: false,
      minify: false,
      sourcemap: true,
      lib: {
        entry: path.resolve(__dirname, "src/index.ts"),
        fileName: "index",
        formats: ["cjs", "es"],
      },
      rollupOptions: {
        external: ["ohm-js"],
      },
    },
    optimizeDeps: {
      include: ["ohm-js"],
      exclude: ["path"],
    },
    server: {
      // host: Configuration.defaults.development.host,
      port: 3000, // Configuration.defaults.development.port,
      strictPort: true,
      force: true,
    },
  };
}) as UserConfigFn;
