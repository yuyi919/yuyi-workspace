import { DEFAULT_EXTENSIONS } from "@babel/core";
import { babelPluginTsdx } from "./babelPluginTsdx";
import { Plugin } from "rollup";
import { ExtendConfig, TsdxOptions } from ".";

export function PluginBabel(extendConfig: ExtendConfig, options: TsdxOptions) {
  const plugins = [];
  if (options.format !== "esm") {
    plugins.push([
      require.resolve("babel-plugin-import"),
      {
        libraryName: "lodash",
        libraryDirectory: "",
        camel2DashComponentName: false,
        style: false,
      },
      "lodash",
    ]);
    plugins.push([
      require.resolve("babel-plugin-import"),
      {
        libraryName: "ant-design-vue",
        libraryDirectory: "es",
        style: "css",
      },
      "antv",
    ]);
  }
  return babelPluginTsdx({
    exclude: "node_modules/**",
    extensions: [...DEFAULT_EXTENSIONS, "ts", "tsx"],
    passPerPreset: true,
    custom: {
      targets: options.target === "node" ? { node: "10" } : undefined,
      extractErrors: options.extractErrors,
      format: options.format,
    },
    plugins,
    babelHelpers: extendConfig.babelHelpers || "bundled",
  });
}

export function pluginReplacer(extendConfig: ExtendConfig, options: TsdxOptions, plugin: Plugin) {
  if (plugin.name === "babel" && ["vue3", "babel-ts"].includes(extendConfig.preset)) {
    return PluginBabel(extendConfig, options);
  }
  if (extendConfig.preset === "ts-only" && plugin.name === "babel") {
    return;
  }
  return plugin;
}
