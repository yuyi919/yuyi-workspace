/* eslint-disable @typescript-eslint/no-unused-vars */
// import vue from "@vitejs/plugin-vue";
// import vueJsx from "@vitejs/plugin-vue-jsx";
import { defineViteConfig } from "@yuyi919/build-tools";
import { resolve } from "path";
import type { ConfigEnv, UserConfig } from "vite";
import html from "vite-plugin-html";
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
      ...(isHttps ? { secure: false } : {}),
    };
  }
  return ret;
}
export default defineViteConfig({
  hooks: ({ command, mode }: ConfigEnv): UserConfig => {
    const isBuild = command === "build";
    const VITE_GLOB_APP_TITLE = "VITE_GLOB_APP_TITLE";
    return {
      mode,
      resolve: {
        alias: {
          "/@/": `${pathResolve("./src/App")}/`,
          "/src/": `${pathResolve("./src")}/`,
          "@yuyi919/rpgmz-core": `${pathResolve("./packages/core/src")}/`,
          "@yuyi919/rpgmz-plugin-transformer": `${pathResolve("./packages/plugin-transformer/src")}/`,
          lodash: "lodash-es",
          "@advscript": pathResolve("../advscript/src/index.ts"),
          "lodash/": "lodash-es/",
        },
      },
      define: {
        "process.env.NODE_ENV": JSON.stringify(mode),
      },
      root: pathResolve("."),
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
            javascriptEnabled: true,
          },
        },
      },
      server: {
        port: 8080,
        proxy: {
          ...createProxy([["/vro", "http://localhost:4090/api/v1"]]),
        },
        hmr: {
          overlay: true,
        },
      },
      assetsInclude: [/project\/img/, /project\/audio/, /project\/icon/],
      build: {
        target: "esnext",
        outDir: "./dist",
        assetsDir: "bundle",
        emptyOutDir: true,
        rollupOptions: {
          external: ["icon.png"],
        },
      },
      plugins: [
        // VitePluginStoryScript(),
        // VitePluginFileSystem(),
        // PurgeIcons(),
        // vueJsx({}),
        // vue({}),
        html({
          minify: isBuild,
          inject: {
            injectData: {
              entry: "./src/main.ts",
              title: VITE_GLOB_APP_TITLE,
            },
            tags: isBuild ? [] : [],
          },
        }),
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
          // "vue",
        ],
        exclude: ["fs"],
      },
    };
  },
});
