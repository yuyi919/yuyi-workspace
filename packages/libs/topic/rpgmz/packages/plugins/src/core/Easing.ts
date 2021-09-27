import * as easingFuncs from "./easingFuncs";
export type EasingType = keyof typeof easingFuncs;
export { easingFuncs };

/**
 * 创建缓动工具
 * @param type 缓动类型，参照 {@link https://echarts.apache.org/examples/zh/editor.html?c=line-easing}
 * @param start 起始
 * @param end 结束
 * @param duration 缓动持续帧数(60帧为1一秒), 不能小于0
 */
export function createEasingHelper(type: EasingType, start: number, end: number, duration: number) {
  if (duration < 0) {
    throw Error("duration 不能小于 0");
  }
  const core: EasingHelper = {
    duration,
    start,
    end,
    process(d: number) {
      const scale = (easingFuncs[type] || easingFuncs.linear)(d / duration);
      return start + (end - start) * scale;
    },
  };
  return core;
}
export interface EasingHelper {
  /**
   * 缓动持续帧数(60帧为1一秒), 不能小于0
   */
  duration: number;
  /**
   * 起始
   */
  start: number;
  /**
   * 结束
   */
  end: number;
  /**
   * 缓动当前帧，区间在0~duration(创建参数)
   * @param d
   */
  process(d: number): number;
}
