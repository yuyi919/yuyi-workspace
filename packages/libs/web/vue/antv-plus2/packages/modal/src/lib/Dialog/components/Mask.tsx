import { getTransitionProps, Transition } from "@antv-plus2/helper";
import { defineComponent } from "vue-demi";
import { LazyRenderBox } from "../LazyRenderBox";

export const Mask = defineComponent({
  inheritAttrs: true,
  props: {
    prefixCls: String,
    visible: Boolean,
    transitionName: String,
    animation: String,
  },
  setup(props, context) {
    const methods = {
      getMaskTransitionName() {
        // const props = core.getOptionProps();
        let transitionName = props.transitionName;
        const animation = props.animation;
        if (!transitionName && animation) {
          transitionName = `${props.prefixCls}-${animation}`;
        }
        return transitionName;
      },
    };
    return () => {
      const maskTransition = methods.getMaskTransitionName();
      const content = props.visible && (
        <LazyRenderBox
          // directives={[{ name: "show", value: props.visible }]}
          key="mask"
          class={`${props.prefixCls}-mask`}
          {...context.attrs}
        />
      );
      if (maskTransition) {
        const maskTransitionProps = getTransitionProps(maskTransition);
        // console.log(maskTransition, maskTransitionProps);
        return (
          <Transition key="mask" {...maskTransitionProps}>
            {content}
          </Transition>
        );
      }
      return content;
    };
  },
});
