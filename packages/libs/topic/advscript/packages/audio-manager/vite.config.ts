/// <reference types="vitest" />
import { defineConfig, UserConfigFn } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(async ({ mode }) => {
  const isProd = mode === "production";
  const isTest = mode === "test";
  const local = true;
  console.log("isProd:", isProd);
  return {
    resolve: {},
    plugins: [
      dts({
        insertTypesEntry: true
      })
    ],
    build: {
      assetsInlineLimit: 0,
      target: "esnext",
      minify: isProd ? "terser" : false,
      commonjsOptions: {
        include: [/node_modules/, /vscode/],
        exclude: ["loader.js"]
      },
      lib: {
        formats: ["es", "cjs"],
        entry: "src/index.ts",
        fileName: "index"
      },
      rollupOptions: {
        external: ["react"]
      }
    },
    test: {
      globals: true,
      environment: "jsdom"
      // includeSource: ["src/**/*.ts"],
      // coverage: {
      //   include: ['src/**/*'],
      //   exclude: [],
      // }
    },
    optimizeDeps: {
      include: [],
      exclude: []
    },
    server: {
      // host: Configuration.defaults.development.host,
      port: 3000, // Configuration.defaults.development.port,
      fs: {
        strict: false
      }
    }
  };
}) as UserConfigFn;
