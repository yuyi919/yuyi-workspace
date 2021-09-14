import type { StyleSheet, Classes } from "jss";
import type { DynamicRules } from "../types";
import { getMeta } from "./sheetsMeta";

const getSheetClasses = (
  sheet: StyleSheet,
  dynamicRules: DynamicRules,
  keyMap?: Record<string, string>
) => {
  if (!dynamicRules) {
    return sheet.classes;
  }

  const classes: Classes = {};
  const meta = getMeta(sheet);

  if (!meta) {
    return sheet.classes;
  }

  // console.log(dynamicRules)
  for (const key in meta.styles) {
    const readKey = (keyMap && keyMap[key]) || key;
    classes[readKey] = sheet.classes[key];
    if (key in dynamicRules) {
      classes[readKey] += ` ${sheet.classes[dynamicRules[key].key]}`;
    }
  }

  return classes;
};

export default getSheetClasses;
