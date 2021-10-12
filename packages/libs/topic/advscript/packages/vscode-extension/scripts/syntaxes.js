const fs = require("fs-extra");
const path = require("path");
const jym = require("js-yaml");

const ymlText = fs
  .readFileSync(require.resolve("../syntaxes/advscript.YAML-tmLanguage"))
  .toString();
// 为了语法高亮，修正
const config = jym.load(ymlText);
fs.writeJSONSync(path.join(__dirname, "../syntaxes/advscript.tmLanguage.json"), config, {
  spaces: 2,
});
