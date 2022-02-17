/* eslint-disable no-use-before-define */
import { defineComponent } from "vue-demi";
import { useInherit } from "@yuyi919/vue-use";
import { Component, extractProps, getPropsClass, Prop, VueComponent2 } from "@antv-plus2/helper";
import Theme, { createUseClasses, styled } from "@antv-plus2/theme";
import { Icon } from "ant-design-vue";

const [classes, useClasses] = createUseClasses("icon", {});
const useStyles = styled.makeUse`
  &${classes.root} {
    color: ${(props: ThemedIconProps, theme) =>
      Theme.getPalette(`${props.color}Color` as any)(props, theme) ||
      Theme.getPalette("primaryColor")(props.color, theme)} !important;
  }
`;

@Component()
export class ThemedIconProps extends getPropsClass(Icon) {
  @Prop({ type: String, default: "primary" })
  color?: "primary" | "second";
}

export const ThemedIcon: VueComponent2<ThemedIconProps> = defineComponent({
  props: extractProps(ThemedIconProps),
  setup(props, context) {
    const classes = useClasses(useStyles(props));
    const [getInherit] = useInherit(context);
    return () => {
      const { theme, ...other } = props;
      const { on, scopedSlots, children } = getInherit();
      return (
        <Icon {...{ on, scopedSlots, props: other }} class={classes.root} theme="outlined">
          {children}
        </Icon>
      );
    };
  },
});
