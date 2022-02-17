import { create, Classes, SheetsRegistry, createGenerateId } from "jss";
import preset from "jss-preset-default";
const jss = create(preset());

export default jss;
export type { Classes };
export { jss, SheetsRegistry, createGenerateId };
