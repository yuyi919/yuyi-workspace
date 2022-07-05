/// <reference types="vitest" />
import path, { join } from "path";
import { readlinkSync } from "fs";
import { escapeRegExp } from "lodash";
import builtins from "rollup-plugin-node-builtins";
import { defineConfig, UserConfigFn } from "vite";
import { vitePluginMacro } from "vite-plugin-macro";
import Provider from "./logger";
import tsconfigPaths from "vite-tsconfig-paths";
import minifyHTML from "rollup-plugin-minify-html-literals";

const macroPlugin = vitePluginMacro({
  typesPath: join(__dirname, "./macros.d.ts"),
  name: "macros",
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp
  include: [new RegExp(escapeRegExp(join(__dirname, "src").replace(/\\/g, "/")) + "/.+\\.ts")],
  exclude: [/langium/, /languageclient/]
})
  .use(Provider)
  .toPlugin();

const langiumDir = resolveLink(path.resolve("./node_modules/langium-workspaces"));
function resolveLink(linkPath: string) {
  let p = linkPath;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let np: string;
    try {
      np = readlinkSync(p);
      if (np === p) {
        break;
      }
    } catch (error) {
      break;
    }
    p = np;
  }
  return p;
}
function resolveLangium(...paths: string[]) {
  return path.join(langiumDir, ...paths);
}

export default defineConfig(async ({ command, mode }) => {
  const isProd = mode === "production";
  const isTest = mode === "test";
  const isBuild = command === "build";
  const local = true;
  console.log("isProd:", isProd);
  return {
    resolve: {
      alias: {
        // "lodash": "lodash-es",
        vscode: path.resolve("./libs/vscode-languageclient/vscode-compatibility.js"),
        "langium/lib": resolveLangium("packages/langium/src"),
        langium: resolveLangium("packages/langium/src/index.ts"),
        "@yuyi919/advscript-language-services": path.resolve(
          "./packages/language-services/src/index.ts"
        ),
        "@yuyi919/advscript-parser": isProd
          ? path.resolve("./node_modules/@yuyi919/advscript-parser")
          : path.resolve("../parser/src/index.ts")
      }
    },
    plugins: [
      {
        name: "builtins",
        enforce: "pre",
        ...builtins({ crypto: true })
      },
      tsconfigPaths(),
      macroPlugin
    ],
    publicDir: command === "build" ? false : "public",
    build: {
      target: ["es2015"],
      outDir: "./public/data/others/plugin/custom",
      emptyOutDir: false,
      // polyfillDynamicImport: false,
      // sourcemap: "inline",
      minify: isProd ? "terser" : false,
      commonjsOptions: {
        include: [/node_modules/, /vscode/],
        exclude: ["loader.js"]
      },
      terserOptions: isProd
        ? {
            format: {
              comments: false
            }
          }
        : void 0,
      lib: {
        formats: ["umd"],
        name: "CustomPlugin",
        entry: "./src/main.ts"
      },
      rollupOptions: {
        output: {
          entryFileNames: "index.js"
        },
        plugins: [
          minifyHTML(),
          {
            name: "builtins",
            enforce: "pre",
            ...builtins({ crypto: true })
          }
        ]
      }
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
    test: {
      // includeSource: ["src/**/*.ts"],
      // coverage: {
      //   include: ['src/**/*'],
      //   exclude: [],
      // }
    },
    optimizeDeps: {
      include: [],
      exclude: ["@addLibs", "@yuyi919/advscript-parser", "@yuyi919/advscript-language-services"]
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
