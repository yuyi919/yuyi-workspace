import { Plugin } from "vite";
import ohm from "ohm-js";

export const BabelTransformer: Plugin["transform"] = async function (
  code: string,
  sourceFileName: string
) {
  try {
    if (/\.(txt|bks|adv|avs)$/.test(sourceFileName)) {
      return `export default \`${code}\``;
    }
    if (/\.ohm$/.test(sourceFileName)) {
      const myGrammar = ohm.grammar(code);
      /**
       * `toRecipe()`为内部方法，预先将ohm语法解析为序列化json
       * 然后调用`ohm.makeRecipe(recipe)`(同样是内部语法)返回完整的解析器
       */
      // @ts-ignore
      const recipe = myGrammar.toRecipe();
      return `import ohm from "ohm-js";export default ohm.makeRecipe(${recipe});`;
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
