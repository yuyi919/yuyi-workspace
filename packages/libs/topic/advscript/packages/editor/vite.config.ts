/// <reference types="vitest" />
import path, { join } from "path";
import { readlinkSync } from "fs";
import { escapeRegExp } from "lodash";
import builtins from "rollup-plugin-node-builtins";
import { defineConfig, UserConfigFn } from "vite";
import { defineMacroPlugin, vitePluginMacro } from "vite-plugin-macro";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import { RawWorkspacePlugin } from "../parser/OhmPlugin";
import { VitePluginStoryScript } from "../parser/VitePluginStoryScript";
import Provider from "./logger";
import MonacoEditorNlsPlugin, {
  esbuildPluginMonacoEditorNls,
  Languages
} from "./vitePluginMonacoEditorNls";

const locale = Languages.zh_hans;
const macroPlugin = vitePluginMacro({
  typesPath: join(__dirname, "./macros.d.ts"),
  name: "macros",
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp
  include: [new RegExp(escapeRegExp(join(__dirname, "src").replace(/\\/g, "/")) + "/.+\\.ts")],
  exclude: [/langium/, /languageclient/]
})
  .use(Provider)
  .toPlugin();

const langiumDir = resolveLink(path.resolve("../../node_modules/langium-workspaces"));
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

export default defineConfig(async ({ mode }) => {
  const isProd = mode === "production";
  const isTest = mode === "test";
  const local = true;
  console.log("isProd:", isProd);
  return {
    resolve: {
      alias: {
        "@yuyi919/zora": path.resolve("./src/test/zora-wrapper.ts"),
        vscode: path.resolve("./libs/vscode-languageclient/vscode-compatibility.js"),
        "langium/lib": resolveLangium("packages/langium/src"),
        langium: resolveLangium("packages/langium/src/index.ts"),
        "@yuyi919/advscript-language-services": isProd
          ? path.resolve("./node_modules/@yuyi919/advscript-language-services")
          : path.resolve("../language-services/src/index.ts"),
        os: path.resolve("./src/os.ts"),
        "@yuyi919/advscript-parser": isProd
          ? path.resolve("./node_modules/@yuyi919/advscript-parser")
          : path.resolve("../parser/src/index.ts")
      }
    },
    plugins: [
      monacoEditorPlugin(),
      // VitePluginLanguageServer(),
      VitePluginStoryScript(),
      RawWorkspacePlugin({ root: "./src" }),
      {
        name: "builtins",
        enforce: "pre",
        ...builtins({ crypto: true })
      },
      MonacoEditorNlsPlugin({ locale })
      // macroPlugin,
    ],
    // esbuild: {
    //   loader: "ts",
    // },
    base: "/advscript-playground/",
    build: {
      assetsInlineLimit: 0,
      target: "esnext",
      // polyfillDynamicImport: false,

      // polyfillDynamicImport: false,
      minify: isProd ? "terser" : false,
      commonjsOptions: {
        include: [/node_modules/, /vscode/],
        exclude: ["loader.js"]
      },
      outDir: "./dist/advscript-playground",
      rollupOptions: {
        plugins: [
          {
            name: "builtins",
            enforce: "pre",
            ...builtins({ crypto: true })
          }
        ],
        output: {
          manualChunks: {
            // editor: ["monaco-editor"],
            parser: ["chevrotain", "@yuyi919/advscript-parser"],
            lsp: ["@yuyi919/advscript-language-services"],
            vsc: ["./libs/vscode-languageclient/vscode-compatibility.js"]
          },
          chunkFileNames: (chunk) => {
            // console.log(chunk.isDynamicEntry, chunk.name)
            return `assets/${chunk.name === "_" ? "workspaces" : chunk.name}.[hash].js`;
          }
        }
        // external: ["os", "path"],
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
      esbuildOptions: {
        plugins: [
          // macroPlugin as any,
          esbuildPluginMonacoEditorNls({
            locale
          })
        ]
      },
      include: [
        "monaco-textmate",
        "monaco-editor-textmate",
        "vscode-jsonrpc",
        "vscode-languageclient",
        "vscode-languageserver",
        "vscode-languageserver-textdocument",
        "reconnecting-websocket",
        "monaco-editor/esm/vs/language/typescript/ts.worker.js",
        "monaco-editor/esm/vs/editor/editor.api.js",
        "monaco-editor/esm/vs/editor/editor.main.js",
        "vscode-languageclient/lib/common/client",
        "vscode-languageserver-protocol/lib/common/utils/is",
        "vscode-uri",
        "vscode",
        // "jssm",
        "chevrotain",
        "regexp-to-ast",
        "@codingame/monaco-jsonrpc",
        "vscode-languageserver-types"
      ],
      exclude: [
        "path",
        "zora-reporters",
        // "monaco-editor",
        "@addLibs",
        "@yuyi919/advscript-parser",
        "@yuyi919/advscript-language-services"
      ]
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
