/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { join, resolve } from "path";
import { babelPluginTsdx } from "./tsdxExtend/babelPluginTsdx";
import type { ConfigEnv, UserConfig } from "vite";
import { VitePluginBabelInternal } from "./VitePluginBabel";
import replacer from "rollup-plugin-replace";

function pathResolve(dir: string, isGlob = false) {
  return resolve(process.cwd(), ".", dir) + (isGlob ? "/" : "");
}
export type Config = ConfigEnv;
const Utils = {
  pathResolve,
};
export function defineViteConfig(config: {
  hooks: (env: Config, utils: typeof Utils) => UserConfig;
  preset?: "babel-ts" | "esbuild";
}) {
  const { hooks, preset = "esbuild(default)" } = config;
  return (env: ConfigEnv): UserConfig => {
    const { command, mode } = env;
    console.log("command:", command);
    console.log("devMode:", mode);
    console.log("preset:", preset);
    const isBuild = command === "build";
    const config = hooks(env, Utils);
    const rollupOptions = config.build?.rollupOptions || {};
    const buildPlugins = rollupOptions.plugins || ((rollupOptions.plugins = []) as Plugin[]);
    if (config.define) {
      buildPlugins.push(
        replacer({
          values: config.define,
        }) as  Plugin
      );
    }
    const plugins = config.plugins || (config.plugins = []);
    if (preset === "babel-ts") {
      config.esbuild = {
        include: /\.ts$/,
      };
      plugins.unshift(VitePluginBabelInternal());
      if (isBuild) {
        plugins.unshift(
          babelPluginTsdx({
            exclude: "node_modules/**",
            extensions: [".js", ".jsx", ".es6", ".es", ".mjs", "ts", "tsx"],
            configFile: join(process.cwd(), ".babelrc"),
            // @ts-ignore
            passPerPreset: true,
            babelHelpers: "bundled",
            custom: {
              format: "esm",
            },
          })
        );
      }
    }
    return config;
  };
}
export default ({ command, mode }: ConfigEnv): UserConfig => {
  const isBuild = command === "build";
  const path = "/";
  const VITE_GLOB_APP_TITLE = "VITE_GLOB_APP_TITLE";
  const GLOB_CONFIG_FILE_NAME = "GLOB_CONFIG_FILE_NAME";
  const version = 1;
  return {
    mode,
    alias: {
      "/@/": `${pathResolve("./src/App")}/`,
      "/src/": `${pathResolve("./src")}/`,
      lodash: "lodash-es",
      "lodash/": "lodash-es/",
    },
    root: pathResolve("project"),
    esbuild: false,
    server: {
      port: 8080,
    },
    assetsInclude: [/project\/img/],
    build: {
      target: "esnext",
      outDir: "./dist",
      assetsDir: "bundle",
      rollupOptions: {
        external: ["icon.png"],
        plugins: [
          isBuild &&
            (babelPluginTsdx({
              exclude: "node_modules/**",
              extensions: [".js", ".jsx", ".es6", ".es", ".mjs", "ts", "tsx"],
              presets: [
                [
                  "@babel/preset-env",
                  {
                    targets: {
                      node: "current",
                    },
                  },
                ],
              ],
              //@ts-ignore
              passPerPreset: true,
              babelHelpers: "bundled",
              custom: {
                format: "esm",
              },
            }) as any),
          // copy({
          //   targets: [
          //     { src: './project/js', dest: './dist'}
          //   ]
          // })
        ],
      },
    },
    plugins: [VitePluginBabelInternal()],
    optimizeDeps: {
      include: [],
      exclude: ["fs"],
    },
  };
};
