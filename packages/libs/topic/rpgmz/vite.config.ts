/* eslint-disable @typescript-eslint/no-unused-vars */
// import vue from "@vitejs/plugin-vue";
// import vueJsx from "@vitejs/plugin-vue-jsx";
import { resolve } from "path";
import type { ConfigEnv, UserConfig } from "vite";
import { defineConfig } from "vite";
import html from "vite-plugin-html";
import builtins from "rollup-plugin-node-builtins";
import VitePluginReact from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import pkg from "./package.json";

// import PurgeIcons from "vite-plugin-purge-icons";
// import { modifyVars } from "./src/config/lessModifyVars";
// import VitePluginFileSystem from "./vite-plugins/filesystem";
// import VitePluginStoryScript from "./vite-plugins/storyscript";

function pathResolve(dir: string) {
  return resolve(__dirname, ".", dir);
}
import type { ServerOptions } from "http-proxy";

type ProxyItem = [string, string];

type ProxyList = ProxyItem[];

type ProxyTargetList = Record<string, ServerOptions & { rewrite: (path: string) => string }>;
const httpsRE = /^https:\/\//;
/**
 * Generate proxy
 * @param list
 */
export function createProxy(list: ProxyList = [["/rpt", "http://10.100.156.251:8081/rpt"]]) {
  const ret: ProxyTargetList = {};
  for (const [prefix, target] of list) {
    const isHttps = httpsRE.test(target);

    // https://github.com/http-party/node-http-proxy#options
    ret[prefix] = {
      target: target,
      changeOrigin: true,
      ws: true,
      rewrite: (path) => path.replace(new RegExp(`^${prefix}`), ""),
      // https is require secure=false
      ...(isHttps ? { secure: false } : {})
    };
  }
  return ret;
}
export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  const isBuild = command === "build";
  const VITE_GLOB_APP_TITLE = "VITE_GLOB_APP_TITLE";
  return {
    mode,
    resolve: {
      dedupe: ["react", "react-dom", "pixi.js"],
      alias: {
        "@yuyi919/rpgmz-core": `${pathResolve("./packages/core/src")}/`,
        "@yuyi919/rpgmz-plugin-transformer": `${pathResolve("./packages/plugin-transformer/src")}/`,
        lodash: "lodash-es",
        "@advscript": pathResolve("../advscript/src/index.ts"),
        "lodash/": "lodash-es/",
        "@plugins/": `${pathResolve("./packages/plugins/src")}/`,
        "@lazarv/wasm-yoga": pathResolve("./packages/plugins/fix/yoga.js")
      }
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      "global.": "globalThis."
    },
    esbuild: {
      // jsx: "transform",
      // jsxFactory: "jsx_runtime.jsxEsbuild",
      // jsxFragment: "jsx_runtime.Fragment",
      // jsxInject: "import * as jsx_runtime from '@yuyi919/vue-jsx-factory'",
    },
    root: __dirname,
    publicDir: command === "build" ? false : "project",
    cacheDir: pathResolve("./node_modules/.vite"),
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            // reference:  Avoid repeated references
            // hack: `true; @import (reference) "${resolve("src/App/design/config.less")}";`,
            // ...modifyVars,
          },
          javascriptEnabled: true
        }
      }
    },
    server: {
      port: 8080
      // proxy: {
      //   ...createProxy([["/vro", "http://localhost:4090/api/v1"]]),
      // },
    },
    assetsInclude: [/project\/img/, /project\/audio/, /project\/icon/],
    build: {
      target: "esnext",
      outDir: "./dist",
      assetsDir: "bundle",
      emptyOutDir: true,
      rollupOptions: {
        output: { strict: false },
        external: ["icon.png"]
      },
      commonjsOptions: {
        include: [
          "@lazarv/wasm-yoga",
          /fix\/yoga\.js/,
          // /@pixi\/polyfill/,
          // /es6-promise-polyfill/,
          // /object-assign/,
          // /eventemitter3/,
          /node_modules/
        ]
      }
    },
    plugins: [
      federation({
        name: "module-name",
        filename: "remoteEntry.js",
        remotes: {
          foo: "remote_foo"
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: pkg.devDependencies.react,
            version: pkg.devDependencies.react
          },
          "react-dom": {
            singleton: true,
            requiredVersion: pkg.devDependencies["react-dom"],
            version: pkg.devDependencies["react-dom"]
          }
        }
      }),
      VitePluginReact({
        babel: {
          configFile: false
        }
        // jsxRuntime: "classic",
        // fastRefresh: false
      }),
      {
        name: "builtins",
        enforce: "pre",
        ...builtins({ crypto: true })
      },
      html({
        minify: isBuild,
        inject: {
          injectData: {
            entry: "./src/main.ts",
            title: VITE_GLOB_APP_TITLE
          },
          tags: isBuild ? [] : []
        }
      })
    ],
    optimizeDeps: {
      include: [
        "tslib",
        // "storytailor/out/environment",
        // "lodash-es",
        // "resize-observer-polyfill",
        // "ant-design-vue",
        // "ant-design-vue/es/locale/zh_CN",
        // "vue-types",
        // "source-map",
        // "@ant-design/icons-vue",
        "react",
        "react-dom",
        "@inlet/react-pixi",
        "vue",
        "pixi.js",
        "@lazarv/wasm-yoga"
      ],
      exclude: ["fs"]
    }
  };
});
