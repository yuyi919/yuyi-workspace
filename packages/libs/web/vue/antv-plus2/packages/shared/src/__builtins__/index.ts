export function usePrefixCls(
  tag: string,
  props?: {
    prefixCls?: string;
  }
) {
  return (props?.prefixCls || "ant") + "-" + tag;
}

export { classnames as cls } from "@antv-plus2/theme";
