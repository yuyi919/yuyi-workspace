import { escapeRegExp } from "lodash";
import fs from "fs-extra";
import ohm from "ohm-js";
import path, { relative } from "path";
import { Plugin } from "vite";
import MagicString from "magic-string";

export function VitePluginStoryScript(): Plugin {
  return {
    name: "vite-plugin-storyscript",
    transform: BabelTransformer,
    config(config) {
      Object.assign(config.resolve.alias, {
        "@adv.ohm": path.join(__dirname, "./ohm/adv.ohm"),
        "@expression.ohm": path.join(__dirname, "./ohm/expression.ohm"),
        "ohm-js": path.join(__dirname, "./node_modules/ohm-js/dist/ohm.min.js"),
      });
    },
    async load(id: string) {
      if (id.indexOf("ohm-js") > -1) {
        const content = fs.readFileSync(id.replace("?commonjs-module", ""));
        return {
          code: `export default (function () {\nconst exports = {}, module = { exports: exports }; \n${content
            .toString()
            .replace(/\bwindow\b/, "globalThis")};\nreturn module.exports;\n})();`,
        };
      }
    },
  };
}

function toResult(code: string) {
  const str = new MagicString(code);
  return {
    code: str.toString(),
    map: str.generateMap({
      includeContent: true,
      hires: true,
    }),
  };
}
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
      return toResult(result);
    }
    if (/(?<!\*)\.(txt|bks|adv|avs)$/.test(sourceFileName)) {
      return toResult(`export default \`${escapeRegExp(code)}\``);
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
       * `toRecipe()`???????????????????????????ohm????????????????????????json
       * ????????????`ohm.makeRecipe(recipe)`(?????????????????????)????????????????????????
       */
      return toResult(output + "\nexport default ns;");
    }
    if (/@libs/.test(sourceFileName)) {
      console.log(sourceFileName);
    }
    return toResult(code);
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
};
