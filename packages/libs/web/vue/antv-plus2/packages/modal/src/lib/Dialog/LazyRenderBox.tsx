import { PropTypes } from "@antv-plus2/helper";
import { defineComponent } from "vue-demi";

export const LazyRenderBox = defineComponent({
  props: {
    visible: PropTypes.looseBool,
    hiddenClassName: PropTypes.string,
    forceRender: PropTypes.looseBool,
  } as any,
  render() {
    return <div>{this.$slots.default}</div>;
  },
});
