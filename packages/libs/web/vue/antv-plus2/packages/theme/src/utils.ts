import { CSSProperties } from "@yuyi919/shared-types";
import _classnames from "classnames";
import { isNumber, kebabCase } from "lodash";
import { keyframes } from "vue-styled-components";

/**
 * 自动转化为尺寸字符串
 * @param size
 * @param suffix 后缀名，默认为'px'
 * @remark 将数字转换为px,字符串则保留不动
 */
export function autoSizer(size?: number | string, suffix = "px"): string | undefined {
  if (isNumber(size as number)) {
    return size + suffix;
  }
  if (typeof size === "string") {
    return size;
  }
}

/**
 * 是否表示像素尺寸
 * @param size
 */
export function isPxSize(size?: number | string): size is number | string {
  return isNumber(size as number) || /^([0-9])(\.([0-9]))px$/.test(size as string);
}

export type KeyframePoint<P extends number = number> =
  | [percent: P, style: CSSProperties]
  | CSSProperties;

export function style2Str(style: CSSProperties): string;
export function style2Str(style: any): string;
export function style2Str(style: CSSProperties) {
  return Object.keys(style)
    .map((key) => `${kebabCase(key)}:${style[key as keyof CSSProperties]}`)
    .join(";");
}
/**
 * 定义css3 Keyframes样式
 * @param points
 */
export function defineKeyframes(
  points: [KeyframePoint, KeyframePoint, ...KeyframePoint[]]
): string {
  return keyframes(
    points
      .map((target, index, list) => {
        const [per, style] =
          target instanceof Array ? target : [(index / (list.length - 1)) * 100, target];
        return `${per}% {${style2Str(style)}}`;
      })
      .join("\n")
  );
}

export const classnames: (...args: (string | string[] | Record<string, any>)[]) => string =
  _classnames;

export const stubObjectStatic = () => ({});
export { keyframes };
