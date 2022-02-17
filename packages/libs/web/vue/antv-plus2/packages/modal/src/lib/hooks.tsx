// import { Scrollbar } from "@project/components-shared";
import { useElementRect, useQuerySelector, useWindowSize } from "@yuyi919/vue-use";
import { computed } from "vue-demi";
import { Scrollbar } from "@antv-plus2/shared";
import { INormalizeModalProps } from "./NormalizeModalProps";

export function useContentRender(
  props: INormalizeModalProps,
  headerRef = useQuerySelector(".ant-modal-header"),
  footerRef = useQuerySelector(".ant-modal-footer")
) {
  const windowSize = useWindowSize();
  function getContentPadding() {
    if (props.placement === "center") {
      return 100 + 24;
    }
    return 0;
  }
  const [footerSize] = useElementRect(footerRef);
  const contentHeight = computed(() => {
    const titleHeight = headerRef.value?.offsetHeight || 0;
    const footerHeight = footerSize.height ?? 0;
    return getContentPadding() + footerHeight + titleHeight;
  });
  const scrollBarProps = computed(() => {
    // 左右布局时控制整体的高度，其余都是控制最大高度
    // console.log("windowSize.height", windowSize.height);
    return props.placement === "left" || props.placement === "right"
      ? {
          height: `calc(100vh - ${contentHeight.value}px)`,
        }
      : {
          maxHeight: windowSize.height - contentHeight.value,
        };
  });
  return [
    (content: any, contentClassName: string) => {
      return (
        <Scrollbar
          viewClass={contentClassName}
          native
          hidden={contentHeight.value === getContentPadding()}
          {...{
            props: scrollBarProps.value,
          }}
        >
          {content}
        </Scrollbar>
      );
    },
    windowSize,
  ] as const;
}
