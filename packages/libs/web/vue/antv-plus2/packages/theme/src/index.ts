import { createHooksApi } from "@yuyi919/vue-jss";
import { createTheme } from "./styles";
import { ThemeUtils } from "./theme/utils";

export * from "./classes";
export * from "./color";
export * from "./colors";
export * from "./styled";
export { createTheme as createMuiTheme } from "./styles";
export * from "./theme";
export * from "./utils";

export type PaletteMode = "light" | "dark";
export default ThemeUtils;

export const MATERIAL_DEFAULT_THEME = createTheme();
export const {
  ThemeContext,
  createUseStyles,
  defineStyles,
  defineClasses,
  createStylesHook,
  createUseStylesHook,
  useBlock,
  useElement,
  useTheme
} = createHooksApi(MATERIAL_DEFAULT_THEME);
const motionCommon = (duration: string) =>
  defineStyles({ animationDelay: duration, animationFillMode: "both" });
const makeMotion = (className: string, keyframeName: string, duration: string) =>
  defineClasses({
    [`@keyframes ${keyframeName}In`]: {
      "0%": `
        transform: scale(0.2);
        opacity: 0;
      `,
      "100%": `
        transform: scale(1);
        opacity: 1;
      `
    },
    [`@keyframes ${keyframeName}Out`]: {
      "0%": `
          transform: scale(0.2);
          opacity: 0;
        `,
      "100%": `
          transform: scale(1);
          opacity: 1;
        `
    },
    "@global": defineClasses({
      [`.${className}-enter, .${className}-appear`]: {
        ...motionCommon(duration),
        animationPlayState: "paused"
      },
      [`.${className}-leave`]: {
        ...motionCommon(duration),
        animationPlayState: "paused"
      },
      [`.${className}-enter.${className}-enter-active, .${className}-appear.${className}-appear-active`]:
        `
        animation-name: $${keyframeName}In;
        animation-play-state: running;
      ` as any,
      [`.${className}-leave.${className}-leave-active`]: `
        animation-name: $${keyframeName}Out;
        animation-play-state: running;
        pointer-events: none;
      ` as any
    })
  });
export const useTransitions = createUseStyles((theme) => {
  const mixins = makeMotion("move", "test", theme.transitions.duration.standard + "ms");
  console.log(mixins);
  return mixins;
});
