import { getThemeColors } from "./themeColors";

export const baseColors = {
  // color palettes
  blue: "#1890ff",
  purple: "#722ed1",
  cyan: "#13c2c2",
  green: "#52c41a",
  magenta: "#eb2f96",
  pink: "#eb2f96",
  red: "#f5222d",
  orange: "#fa8c16",
  yellow: "#fadb14",
  volcano: "#fa541c",
  geekblue: "#2f54eb",
  lime: "#a0d911",
  gold: "#faad14",
} as const;
export type BaseColorsKey = keyof typeof baseColors;
const Colors = {
  ...getThemeColors("blue", baseColors.blue),
  ...getThemeColors("purple", baseColors.purple),
  ...getThemeColors("cyan", baseColors.cyan),
  ...getThemeColors("green", baseColors.green),
  ...getThemeColors("magenta", baseColors.magenta),
  ...getThemeColors("pink", baseColors.pink),
  ...getThemeColors("red", baseColors.red),
  ...getThemeColors("orange", baseColors.orange),
  ...getThemeColors("yellow", baseColors.yellow),
  ...getThemeColors("volcano", baseColors.volcano),
  ...getThemeColors("geekblue", baseColors.geekblue),
  ...getThemeColors("lime", baseColors.lime),
  ...getThemeColors("gold", baseColors.gold),
} as const;
// @preset-colors: pink, magenta, red, volcano, orange, yellow, gold, cyan, lime, green, blue, geekblue,
//   purple;
export { Colors };
