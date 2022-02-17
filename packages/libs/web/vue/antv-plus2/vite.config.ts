/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineViteConfig } from "@yuyi919/build-tools";
import { createVuePlugin } from "vite-plugin-vue2";
import vitePluginImp from "vite-plugin-imp";
import { join } from "path";
import { readTsConfig } from "@nrwl/workspace/src/utilities/typescript";
const VariablesOutput = require("less-plugin-variables-output");

export default defineViteConfig({
  // preset: "babel-ts",
  hooks: (_, utils) => {
    const paths = loadTsconfigPaths("./tsconfig.path.json");
    return {
      logLevel: "info",
      resolve: {
        alias: {
          ...paths,
          lodash: "lodash-es",
          "/src/*": utils.pathResolve("./src", true),
          "/src/": utils.pathResolve("./index.ts"),
          "@ant-design/icons/lib/dist": "@ant-design/icons/lib/index.es.js",
          "vue-demi": utils.pathResolve("./node_modules/vue-demi2", true),
          "@yuyi919/vue-jsx-factory/jsx-runtime": "@yuyi919/vue-jsx-factory/jsx-runtime-es",
        },
      },
      root: utils.pathResolve("./playground"),
      build: {
        minify: false,
        sourcemap: true,
      },
      esbuild: {
        jsx: "transform",
        jsxFactory: "jsx_runtime.jsxEsbuild",
        jsxFragment: "jsx_runtime.Fragment",
        jsxInject: "import * as jsx_runtime from '@yuyi919/vue-jsx-factory'",
      },
      plugins: [
        createVuePlugin({
          jsx: false,
          vueTemplateOptions: {},
        }) as any,
        {
          transform(code, id) {
            if (code && id.endsWith(".txt")) {
              return `export default \`${code.replace(/`/g, "\\`")}\``;
            }
          },
        },
        vitePluginImp({
          libList: [
            {
              libName: "ant-design-vue",
              libDirectory: "es",
              camel2DashComponentName: true,
              style: (name) => {
                return false; //`ant-design-vue/es/${name}/style`;
              },
            },
          ],
        }) as any,
      ],
      optimizeDeps: {
        exclude: ["@vue/composition-api", "@yuyi919-vue/jss", "vue-demi", "vue-demi2"],
        include: ["classnames", "tslib", "lodash-es", "vue", "ant-design-vue/es/style.js"],
      },
      css: {
        modules: {
          scopeBehaviour: "global",
          exportGlobals: true,
          localsConvention: "camelCaseOnly",
        },
        preprocessorOptions: {
          less: {
            strict: false,
            modifyVars: {
              /* less 变量覆盖，用于自定义 ant design 主题 */
              /*
              'primary-color': '#F5222D',
              'link-color': '#F5222D',
              'border-radius-base': '40px',
              */
            },
            javascriptEnabled: true,
            plugins: [
              new VariablesOutput({
                filename: "variables.json",
              }),
            ],
          },
        },
      },
    };
  },
});

function loadTsconfigPaths(tsconfigPath: string) {
  const loaded = readTsConfig(tsconfigPath) || {};
  const { paths, baseUrl } = loaded.options;
  for (const key in paths) {
    paths[key] = paths[key]?.map((path: string) => join(process.cwd(), baseUrl, path));
  }
  return paths;
}
