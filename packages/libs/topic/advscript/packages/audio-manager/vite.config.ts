/// <reference types="vitest" />
import path, { join } from "path";
import { readlinkSync } from "fs";
import { escapeRegExp } from "lodash";
import { defineConfig, UserConfigFn } from "vite";

export default defineConfig(async ({ mode }) => {
  const isProd = mode === "production";
  const isTest = mode === "test";
  const local = true;
  console.log("isProd:", isProd);
  return {
    resolve: {},
    plugins: [],
    base: "/advscript-playground/",
    build: {
      assetsInlineLimit: 0,
      target: "esnext",
      minify: isProd ? "terser" : false,
      commonjsOptions: {
        include: [/node_modules/, /vscode/],
        exclude: ["loader.js"]
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