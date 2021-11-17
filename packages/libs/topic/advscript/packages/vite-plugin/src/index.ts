import { Plugin } from "vite";
import ohm from "ohm-js";
import { relative } from "path";
import { escapeRegExp } from "lodash"

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
      const myGrammar = ohm.grammar(code);
      /**
       * `toRecipe()`为内部方法，预先将ohm语法解析为序列化json
       * 然后调用`ohm.makeRecipe(recipe)`(同样是内部语法)返回完整的解析器
       */
      // @ts-ignore
      const recipe = myGrammar.toRecipe();
      return `import ohm from "ohm-js/dist/ohm.min.js";export default ohm.makeRecipe(${recipe});`;
    }
    return code;
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
};
export default function (): Plugin {
  return {
    name: "vite-plugin-storyscript",
    transform: BabelTransformer,
  };
}
