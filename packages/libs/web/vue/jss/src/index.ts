export { default as createUseStyles } from "./createUseStyles";

// TODO:
export { default as JssProvider } from "./JssProvider";

export { default as jss } from "./jss";
import { default as jss } from "./jss";
export { SheetsRegistry, createGenerateId } from "jss";
import stt from "./helper/merge"

export * from "./theming";
export * from "./Factory";
// JSS Setup
// jss.use(jssPluginExtend())
const sheets = jss.createStyleSheet(stt, { link: true }).attach();

// Application logic.
const div = document.createElement("div");
div.innerHTML = `\
  <button class="${sheets.classes.button0}">Button 1</button>\
  <button class="${sheets.classes.button1}">Button 2</button>\
`;

sheets.update({ background: "red" });
document.body.before(div);
