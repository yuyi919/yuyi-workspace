import { defineConfig, UserConfigFn } from "vite";
import dts from "vite-plugin-dts";
import plugin from "@yuyi919/advscript-vite-plugin";
import path from "path";

export default defineConfig(async ({ mode }) => {
  return {
    resolve: {
      alias: {
        "@adv.ohm-bundle":
          mode === "production" ? path.resolve("./ohm/adv.ohm-bundle") : "./ohm/adv.ohm-bundle",
      },
    },
    plugins: [
      dts({ copyDtsFiles: true, insertTypesEntry: true }),
      plugin(),
    ],
    build: {
      // assetsInlineLimit: 0,
      // cssCodeSplit: false,
      target: "esnext",
      commonjsOptions: {
        esmExternals: ["@adv.ohm-bundle"],
      },
      polyfillDynamicImport: false,

      // polyfillDynamicImport: false,
      minify: mode === "production" ? "terser" : false,
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
      include: ["ohm-js", "@adv.ohm-bundle"],
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
