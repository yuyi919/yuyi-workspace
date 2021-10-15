import { defineConfig, UserConfigFn } from "vite";

export default defineConfig(async ({ mode }) => {
  return {
    resolve: {},
    plugins: [],
    base: "/$BASE_URL$/",
    root: __dirname,
    build: {
      // assetsInlineLimit: 0,
      // cssCodeSplit: false,
      outDir: "../../out/webviews/preview",
      target: "modules",
      commonjsOptions: {},
      polyfillDynamicImport: false,

      // polyfillDynamicImport: false,
      minify: mode !== "production" ? "terser" : false,
      sourcemap: true,
      rollupOptions: {
        output: {
          globals: {
            jquery: "$", //告诉rollup 全局变量$即是jquery
          },
        },
      },
    },
    optimizeDeps: {
      include: ["d3"],
      exclude: ["path", "jquery"],
    },
    server: {
      // host: Configuration.defaults.development.host,
      port: 3000, // Configuration.defaults.development.port,
      strictPort: true,
      force: true,
    },
  };
}) as UserConfigFn;
