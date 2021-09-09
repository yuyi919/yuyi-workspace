/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createConfigItem } from "@babel/core";
import { PluginItem, ConfigItem } from "@babel/core";
import { createBabelInputPluginFactory, RollupBabelInputPluginOptions } from "@rollup/plugin-babel";
import { merge } from "lodash";

export const isTruthy = (obj?: any) => {
  if (!obj) {
    return false;
  }
  return obj.constructor !== Object || Object.keys(obj).length > 0;
};

// replace lodash with lodash-es, but not lodash/fp
const replacements = [{ original: "lodash(?!/fp)", replacement: "lodash-es" }];

export const mergeConfigItems = (type: any, ...configItemsToMerge: PluginItem[][]) => {
  const mergedItems = [];
  configItemsToMerge.forEach((configItemToMerge) => {
    configItemToMerge.forEach((item: ConfigItem) => {
      if (item instanceof Object) {
        if (item.file.request === "babel-plugin-import") {
          mergedItems.push(item);
        } else {
          const itemToMergeWithArr = Object.entries(mergedItems).filter(
            ([, mergedItem]) => mergedItem.file.resolved === item.file.resolved
          );
          if (!itemToMergeWithArr.length) {
            mergedItems.push(item);
            return;
          }
          itemToMergeWithArr.forEach(([itemToMergeWithIndex, mergedItem]) => {
            if (mergedItem.file.resolved === item.file.resolved)
              mergedItems[itemToMergeWithIndex] = createConfigItem(
                [
                  mergedItems[itemToMergeWithIndex].file.resolved,
                  merge(mergedItems[itemToMergeWithIndex].options, item.options),
                ],
                {
                  type,
                }
              );
          });
        }
      }
    });
  });
  return mergedItems;
};

export const createConfigItems = (type: any, items: any[]) => {
  return items.map(({ name, ...options }) => {
    return createConfigItem([require.resolve(name), options], { type });
  });
};

export const babelPluginTsdx = createBabelInputPluginFactory(() => ({
  // Passed the plugin options.
  options({ custom: customOptions, ...pluginOptions }) {
    return {
      // Pull out any custom options that the plugin might have.
      customOptions,
      // Pass the options back with the two custom options removed.
      pluginOptions,
    };
  },
  config(config, { customOptions }) {
    const defaultPlugins = createConfigItems(
      "plugin",
      [
        // {
        //   name: '@babel/plugin-transform-react-jsx',
        //   pragma: customOptions.jsx || 'h',
        //   pragmaFrag: customOptions.jsxFragment || 'Fragment',
        // },
        { name: "babel-plugin-macros" },
        { name: "babel-plugin-annotate-pure-calls" },
        { name: "babel-plugin-dev-expression" },
        customOptions.format === "esm" && {
          name: "babel-plugin-transform-rename-import",
          replacements,
        },
        {
          name: "babel-plugin-polyfill-regenerator",
          // don't pollute global env as this is being used in a library
          method: "usage-pure",
        },
        // 考虑到装饰器插件有执行顺序, 让用户自己选择是否启
        // {
        //   name: "@babel/plugin-proposal-class-properties",
        //   loose: true,
        // },
        isTruthy(customOptions.extractErrors) && {
          name: "tsdx/dist/errors/transformErrorMessages",
        },
      ].filter(Boolean)
    );
    const babelOptions = config.options || {};
    babelOptions.presets = babelOptions.presets || [];
    const presetEnvIdx = babelOptions.presets.findIndex((preset: any) =>
      preset.file.request.includes("@babel/preset-env")
    );
    // if they use preset-env, merge their options with ours
    if (presetEnvIdx !== -1) {
      const presetEnv: any = babelOptions.presets[presetEnvIdx];
      babelOptions.presets[presetEnvIdx] = createConfigItem(
        [
          presetEnv.file.resolved,
          merge(
            {
              loose: true,
              targets: customOptions.targets,
            },
            presetEnv.options,
            {
              modules: false,
            }
          ),
        ],
        {
          type: `preset`,
        }
      );
    } else {
      // if no preset-env, add it & merge with their presets
      const defaultPresets = createConfigItems("preset", [
        {
          name: "@babel/preset-env",
          targets: customOptions.targets,
          modules: false,
          loose: true,
        },
      ]);
      babelOptions.presets = mergeConfigItems("preset", defaultPresets, babelOptions.presets);
    }
    // Merge babelrc & our plugins together
    babelOptions.plugins = mergeConfigItems("plugin", defaultPlugins, babelOptions.plugins || []);
    // console.log(babelOptions);
    return { ...babelOptions };
  },
})) as (
  options?: RollupBabelInputPluginOptions & { custom?: any; passPerPreset?: boolean }
) => Plugin;
