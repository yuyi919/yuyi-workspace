/* eslint-disable no-use-before-define */
import { computed, defineComponent, getCurrentInstance, reactive, watch } from "vue-demi";
import { useElementRect, useInherit, useNamedRef } from "@yuyi919/vue-use";
import { autoSizer, styled } from "@antv-plus2/theme";

interface IAutoSizerProps {
  nowrap?: boolean;
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
}

const useStyles = styled.makeUse`
  div[data-auto-sizer]& {
    width: ${(props: IAutoSizerProps) => autoSizer(props.width)};
    height: ${(props: IAutoSizerProps) => autoSizer(props.height)};
    display: block;
    & > div[data-auto-sizer-inner] {
      display: ${(props: IAutoSizerProps) =>
        props.width !== null && props.width !== void 0 && props.width !== 0
          ? "block"
          : "inline-block"};
      width: auto;
      white-space: nowrap;
      & > * {
        white-space: ${(props) => props.nowrap !== true && "normal"};
      }
    }
  }
`;
function maxSize(target: number | string, minSize?: number | string) {
  return minSize !== void 0
    ? typeof target === "number" && typeof minSize === "number"
      ? Math.min(target, minSize)
      : target === "auto"
      ? minSize
      : target
    : target;
}
function minSize(target: number | string, minSize?: number | string) {
  return minSize !== void 0
    ? typeof target === "number" && typeof minSize === "number"
      ? Math.max(target, minSize)
      : target === "auto"
      ? minSize
      : target
    : target;
}
function fixSize(target: number | string, max?: number | string, min?: number | string) {
  const result = maxSize(minSize(target, min), max);
  // console.log("fixSize", target, max, min, result);
  return result;
}
export interface AutoSizerAction {
  forceUpdate(): void;
}
export const AutoSizer = defineComponent({
  emits: ["change", "update:width", "update:height"],
  props: {
    width: [Number, String],
    height: [Number, String],
    minWidth: [Number, String],
    maxWidth: [Number, String],
    minHeight: [Number, String],
    maxHeight: [Number, String],
    nowrap: [Boolean],
  },
  setup(props, context) {
    const elRef = useNamedRef<HTMLElement>("elRef");
    const [rect] = useElementRect(elRef.ref());
    const localSize = reactive({
      width: computed(() => fixSize(props.width || rect.width, props.maxWidth, props.minWidth)),
      height: computed(() =>
        fixSize(props.height || rect.height, props.maxHeight, props.minHeight)
      ),
      nowrap: computed(() => props.nowrap),
    });
    const className = useStyles(localSize);
    const [getInherit] = useInherit(context);
    const self = getCurrentInstance()!.proxy;
    let timeFlag: any;
    function forceUpdate() {
      if (elRef.value) {
        timeFlag && clearTimeout(timeFlag);
        elRef.value.style.position = "absolute";
        timeFlag = setTimeout(() => {
          elRef.value && (elRef.value.style.position = null!);
        }, 200);
      }
    }
    Object.assign(self, {
      forceUpdate,
    } as AutoSizerAction);
    watch(
      () => ({ ...localSize }),
      (size) => context.emit("change", size)
    );
    watch(
      () => rect.width,
      (width) => {
        context.emit("update:width", fixSize(width, props.maxWidth, props.minWidth));
        // console.log("update width", width);
        if (elRef.value && elRef.value.style.position === "absolute") {
          timeFlag && clearTimeout(timeFlag);
          elRef.value.style.position = null!;
          timeFlag = null;
        }
      }
    );
    watch(
      () => rect.height,
      (height) => context.emit("update:height", fixSize(height, props.maxHeight, props.minHeight))
    );

    return () => {
      const { children } = getInherit();
      return (
        <div data-auto-sizer class={className.value}>
          <div key="inner-native" data-auto-sizer-inner ref={elRef}>
            {children}
          </div>
        </div>
      );
    };
  },
});
