import type * as rpc from "@codingame/monaco-jsonrpc";
import glob from "glob";
import type * as http from "http";
import { escapeRegExp } from "lodash";
import * as net from "net";
import ohm from "ohm-js";
import { relative, resolve } from "path";
import * as url from "url";
import { Plugin, ResolvedConfig } from "vite";
import * as ws from "ws";
import { launch } from "./src/server";
export const BabelTransformer: Plugin["transform"] = async function (
  code: string,
  sourceFileName: string
) {
  try {
    if (/\.ohm-bundle/.test(sourceFileName)) {
      const result = code.replace(
        `'use strict';const ohm=require('ohm-js');module.exports=`,
        'import * as ohm from "ohm-js"; export default '
      );
      const nameMatch = code.match(/"source":"(.+) \{/);
      console.log(
        `load ${
          nameMatch[1]
            ? `${nameMatch[1]}.ohm (${relative(process.cwd(), sourceFileName)})`
            : sourceFileName
        } ${result !== code ? "(use esmodule)" : ""}`
      );
      return result;
    }
    if (/\.(txt|bks|adv|avs)$/.test(sourceFileName)) {
      return `export default \`${escapeRegExp(code)}\``;
    }
    if (/\.ohm$/.test(sourceFileName)) {
      const grammars = ohm.grammars(code);
      let output = `import ohm from "ohm-js";\n`;
      // If it's a single-grammar source file, the default export is the grammar.
      // Otherwise, the export is a (possibly empty) Namespace containing the grammars.
      // if (!isSingleGrammar) {
      output += "const ns = ohm.createNamespace();";
      // }
      for (const [name, grammar] of Object.entries(grammars)) {
        const { superGrammar } = grammar;
        const superGrammarExpr = superGrammar.isBuiltIn() ? void 0 : `ns.${superGrammar.name}`;
        output += `ns.${name}=`;
        // @ts-ignore
        output += `ohm.makeRecipe(${grammar.toRecipe(superGrammarExpr)});`;
      }
      /**
       * `toRecipe()`为内部方法，预先将ohm语法解析为序列化json
       * 然后调用`ohm.makeRecipe(recipe)`(同样是内部语法)返回完整的解析器
       */
      return output + "\nexport default ns";
    }
    if (/@libs/.test(sourceFileName)) {
      console.log(sourceFileName);
    }
    return code;
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
};
const defaultVirtualFileId = "@addLibs/";
export default function (): Plugin {
  return {
    name: "vite-plugin-storyscript",
    transform: BabelTransformer,
    configureServer(server) {
      const wss = new ws.Server({
        noServer: true,
        perMessageDeflate: false,
      });
      server.httpServer.on(
        "upgrade",
        (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
          const pathname = request.url ? url.parse(request.url).pathname : undefined;
          if (pathname.endsWith("/sampleServer")) {
            wss.handleUpgrade(request, socket, head, (webSocket) => {
              const socket: rpc.IWebSocket = {
                send: (content) =>
                  webSocket.send(content, (error) => {
                    if (error) {
                      throw error;
                    }
                  }),
                onMessage: (cb) => webSocket.on("message", cb),
                onError: (cb) => webSocket.on("error", cb),
                onClose: (cb) => webSocket.on("close", cb),
                dispose: () => webSocket.close(),
              };
              // launch the server when the web socket is opened
              if (webSocket.readyState === webSocket.OPEN) {
                launch(socket);
              } else {
                webSocket.on("open", () => launch(socket));
              }
            });
          }
        }
      );
      // launch({
      //   send(content) {
      //     console.log("send", content);
      //   },
      //   onClose(cb) {
      //     console.log("onClose", cb);
      //   },
      //   onError(cb) {
      //     console.log("onError", cb);
      //   },
      //   onMessage(cb) {
      //     console.log("onMessage", cb);
      //   },
      //   dispose() {
      //     console.log("dispose");
      //   },
      // });
    },
  };
}
export const RawPlugin = ({
  root = ".",
  dynamic = true,
  virtualFileId = defaultVirtualFileId,
}): Plugin => {
  let config: ResolvedConfig;
  return {
    name: "virtual-plain-text",
    resolveId(id: string) {
      if (id.indexOf(virtualFileId) === 0) {
        return {
          id,
        };
      }
    },
    configResolved(_config) {
      config = _config;
    },
    async load(id: string) {
      if (id.indexOf(virtualFileId) === 0) {
        const globPath = id.replace(virtualFileId, "");
        const files = glob.sync(resolve(root, globPath), { dot: true });
        // console.log(globPath, files);
        const groups: string[] = [];
        let i = 0;
        for (const filePath of files) {
          // const content = await promises.readFile(filePath, { encoding: "utf-8" });
          // console.log((await this.resolve(filePath)).id);
          if (dynamic) {
            groups.push(
              `obj[${JSON.stringify(relative(root, filePath))}] = () => import("/${relative(
                config.root,
                filePath
              ).replace(/\\/g, "/")}?raw").then(m => m.default)`
            );
          } else {
            const aliasName = `module${i++}`;
            groups.push(
              `import { default as ${aliasName} } from "${filePath}?raw"; obj[${JSON.stringify(
                relative(root, filePath)
              )}] = ${aliasName}`
            );
          }
        }

        // const modulesDir = join(config.root, "/node_modules/");
        // const replaceFiles: string[] = files.map((f, i) => {
        //   groups.push(g1 + i);
        //   return `import ${g1 + i} from ${g2}${resolver.fileToRequest(f)}${g2}`;
        // });
        return {
          code: `const obj = {};\n${groups.join("\n")}\nexport default obj;`,
        };
      }
    },
  };
};
