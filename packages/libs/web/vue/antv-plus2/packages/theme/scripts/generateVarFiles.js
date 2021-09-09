const { writeFileSync, ensureDirSync } = require("fs-extra");
const { upperFirst, camelCase } = require("lodash");

// 生成导出颜色变量的文件
generateVarFiles(
  "palette.colors",
  [
    "blue",
    "purple",
    "cyan",
    "green",
    "magenta",
    "pink",
    "red",
    "orange",
    "yellow",
    "volcano",
    "geekblue",
    "lime",
    "gold",
  ],
  (color) => generateColorList(color),
  () => "string[]"
);
function generateColorList(color) {
  return `lighten(@${color}-6, 44), ${Array(10)
    .fill(true)
    .map((_, i) => `@${color}-${i + 1}`)
    .join(", ")}`;
}

// 生成导出颜色变量的文件
generateVarFiles(
  "palette",
  Array.from(
    `@primary-color: @blue-6;
      @info-color: @blue-6;
      @success-color: @green-6;
      @processing-color: @blue-6;
      @error-color: @red-6;
      @highlight-color: @red-6;
      @warning-color: @gold-6;
      @normal-color: #d9d9d9;
      @white: #fff;
      @black: #000;

      @second-color: #2ac2bd;
`.matchAll(/@(.+?):.+;/g)
  )
    .map((i) => i[1])
    .concat(["primary", "second"]),
  (color) =>
    ["primary", "second"].includes(color) // === "primary"
      ? `${Array(11)
          .fill(true)
          .map((_, i) => `@${color}-${i}`)
          .join(", ")}`
      : `@${color}`,
  (color) => (["primary", "second"].includes(color) ? "string[]" : "string")
);

// 生成导出颜色变量的文件
generateVarFiles(
  "component",
  ["prefix-cls", "border-color-base", "border-radius-base"],
  (color) => (color === "prefix-cls" ? `@component-${color}` : `@${color}`),
  (color) => "string"
);

/**
 *
 * @param {string} name
 * @param {string[]} varNames
 * @param {(name: string) => string} pipe
 * @param {(name: string) => 'mapKey' | 'string[]' | 'string'} define
 */
function generateVarFiles(name, varNames, pipe, define = () => "string") {
  const camelCaseVarNames = varNames.map(camelCase);
  const lessFile = `
@import "./theme.less";
// 导出部分less变量共享给js
:export {
${varNames
  .map((varName) => `  ${camelCase(varName)}: ${pipe ? pipe(varName) : `@${varName}`};`)
  .join("\n")}
}
`;

  const dts = `
/**
 * @package ${upperFirst(name)}
 */

 ${varNames
   .map(
     (varName) => `  /** 
* @name @${varName}
*/
declare const ${camelCase(varName)}: string;`
   )
   .join("\n")}
export { ${varNames.map(camelCase).join(", ")} };
exports = { ${varNames.map(camelCase).join(", ")} };
`;

  const commonName = camelCase(name);
  const PublicName = upperFirst(commonName);
  const InterfaceName = `I${PublicName}`;
  const ts = `
/**
* @package ${PublicName}
*/
/* eslint-disable no-redeclare */
import { Getter } from "./interface";
${generateImports()}

${generateInterface(InterfaceName)}

${generateConstsNamedExport()}

${generateUseFunction()}

export const ${commonName}: ${`I${upperFirst(camelCase(name))}`} = Object.freeze({
${varNames.map((varName) => `  ${camelCase(varName)},`).join("\n")}
})
`;
  ensureDirSync("./exports");
  writeFileSync(`./exports/${name}.module.less`, lessFile);
  writeFileSync(`./exports/${name}.module.less.d.ts`, dts);
  ensureDirSync("./src/exports");
  writeFileSync(`./src/exports/${name}.ts`, ts);

  function generateImports() {
    return `import type { ThemeProps, Theme } from '../styled/provider';
import { ${varNames
      .map((varName) => `${camelCase(varName)} as _${camelCase(varName)}`)
      .join(", ")} } from '../../exports/${name}.module.less'`;
  }
  /**
   * 生成具名导出
   */
  function generateConstsNamedExport() {
    return varNames
      .map(
        (varName) => `${generateVarComment(varName, "")}
export const ${camelCase(varName)}: ${InterfaceName}["${camelCase(varName)}"] = ${
          define(varName) === "string[]"
            ? `_${camelCase(varName)}.split(",").map(v => v.trim())`
            : `_${camelCase(varName)}`
        };`
      )
      .join("\n");
  }

  function generateVarComment(varName, append = "  ") {
    return `${append}/** 
${append}* @name @${varName}
${append}*/`;
  }

  function generateInterface(interfaceName) {
    return `export interface ${interfaceName} {
${varNames
  .map(
    (varName) => `${generateVarComment(varName)}
  ${camelCase(varName)}: ${define(varName)};`
  )
  .join("\n")}
}`;
  }

  function generateUseFunction() {
    const useFunctionName = camelCase("use-" + name);
    const getFunctionName = camelCase(name + "-getter");
    const getName = (varName) => `${name}.${camelCase(varName)}`;
    return `${varNames
      .map(
        (varName) => `  /** 
* @name 取得变量${varName}
*/
export function ${useFunctionName}(name: "${camelCase(
          varName
        )}"): Getter<${InterfaceName}["${camelCase(varName)}"]>;`
      )
      .join("\n")}
export function ${useFunctionName}<K extends keyof ${InterfaceName}>(name: K): Getter<${InterfaceName}[K]>;
export function ${useFunctionName}(name: string) {
${
  (false &&
    `  switch (name) {
${varNames
  .map((varName) => {
    return `    case "${getName(varName)}": 
      return (props: ThemeProps) => ${("props.theme." + getName(varName))
        .split(".")
        .join("?.")} || ${commonName}.${camelCase(varName)};`;
  })
  .join("\n")}
  }`) ||
  ""
}
  return (${getFunctionName}[name as keyof typeof ${getFunctionName}] || (() => void 0)) as any
};
export const ${getFunctionName} = Object.freeze({
${varNames
  .map(
    (varName) =>
      `  ${camelCase(
        varName
      )}${`(props: any, theme?: Theme) { return (theme || props.theme)?.${getName(varName)
        .split(".")
        .join("?.")} || ${commonName}.${camelCase(varName)};`} }`
  )
  .join(",\n")}
})
`;
  }
}
