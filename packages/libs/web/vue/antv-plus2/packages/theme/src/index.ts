import { ThemeUtils } from "./theme/utils";

export * from "./classes";
export * from "./color";
export * from "./colors";
export * from "./styled";
export { createTheme as createMuiTheme } from "./styles";
export * from "./theme";
export * from "./utils";

export type PaletteMode = 'light' | 'dark';
export default ThemeUtils;
