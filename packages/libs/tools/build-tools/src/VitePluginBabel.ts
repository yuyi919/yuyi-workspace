/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable @typescript-eslint/no-unused-vars */
import path from "path";
import { Plugin } from "vite";
import { transformAsync } from "@babel/core";

export function resolve(name: string, pathStr: string) {
  return path
    .relative(
      path.dirname(pathStr),
      require.resolve(name).replace(/\\/g, "/").split(name)[0] + name
    )
    .replace(/\\/g, "/");
}

// @ts-ignore
export const BabelTransformer: Plugin["transform"] = async function (code: string, id: string) {
  try {
    const fileName = path.relative(process.cwd(), id);
    if (!/node_modules/.test(id) && /\.(t|j)s(x|)$/.test(id)) {
      try {
        const result = await transformAsync(code, {
          filename: fileName,
          cwd: process.cwd(),
          sourceMaps: true,
          configFile: path.join(process.cwd(), ".babelrc"),
        });
        
        return {
          code: result.code,
          map: result.map,
        };
      } catch (error) {
        console.error(id, process.cwd());
        console.error(error);
      }
    }
    return code;
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
};
export function VitePluginBabelInternal(): Plugin {
  return {
    name: VitePluginBabelInternal.PluginName,
    transform: BabelTransformer
    // configureServer: (async (server) => {
    //   server.app.use((req, res, next) => {
    //     if (req.url.indexOf("png") > -1) {
    //       req.url = decodeURI(req.url)
    //       console.log(req.url)
    //     }
    //     next()
    //     return
    //   })
    // }) as ServerHook
  };
}
VitePluginBabelInternal.PluginName = "vite-plugin-babel-internal";
