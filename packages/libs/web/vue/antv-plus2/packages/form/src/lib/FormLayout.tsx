import { extractUnsafeProps, VueComponent2 } from "@antv-plus2/helper";
import { useInherit } from "@yuyi919/vue-use";
import { computed, defineComponent } from "vue-demi";
import { cls, usePrefixCls } from "../__builtins__";
import { FormLayoutDeepContext, FormLayoutShallowContext, useFormDeepLayout } from "./context";
import { FormLayoutItem } from "./FormItem";
import { FormLayoutProps } from "./FormLayoutProps";
// console.log(Definitions.extractProps(IFormLayoutProps), Definitions.extractProps(LayoutProps));
const [FormLayoutPropsConfig, normlize] = extractUnsafeProps(FormLayoutProps, (props) => {
  return {
    ...props,
    labelAlign: props.labelAlign ?? (props.layout === "vertical" ? "left" : "right"),
  };
});
export const FormLayout = Object.assign(
  defineComponent({
    props: FormLayoutPropsConfig,
    setup(props: FormLayoutProps, context) {
      const [getInherit] = useInherit(context);
      const deepLayoutRef = useFormDeepLayout();
      FormLayoutDeepContext.provide(
        computed(() => {
          const deepLayout = deepLayoutRef?.value || {};
          const newDeepLayout = {
            ...deepLayout,
          };
          if (!props.shallow) {
            Object.assign(newDeepLayout, props);
          } else {
            if (props.size) {
              newDeepLayout.size = props.size;
            }
            if (props.colon) {
              newDeepLayout.colon = props.colon;
            }
          }
          return newDeepLayout;
        })
      );
      FormLayoutShallowContext.provide(
        computed(() => {
          const normalizedProps = normlize(props, (prop, value, option) => {
            return value;
          });
          // console.log(normalizedProps);
          return normalizedProps.shallow ? normalizedProps : void 0;
        })
      );
      return () => {
        const formPrefixCls = usePrefixCls("form");
        const layoutPrefixCls = usePrefixCls("formily-layout", { prefixCls: props.prefixCls });
        const layoutClassName = cls(layoutPrefixCls, {
          [`${layoutPrefixCls}-${props.layout}`]: true,
          [`${formPrefixCls}-${props.layout}`]: true,
          [`${formPrefixCls}-rtl`]: props.direction === "rtl",
          [`${formPrefixCls}-${props.size}`]: props.size,
        });
        return <div class={layoutClassName}>{getInherit().children}</div>;
      };
    },
  }) as VueComponent2<FormLayoutProps>,
  {
    Item: FormLayoutItem,
  }
);

// FormLayout.defaultProps = {
//   shallow: true,
// };

// FormLayout.useFormDeepLayout = useFormDeepLayout;
// FormLayout.useFormShallowLayout = useFormShallowLayout;
// FormLayout.useFormLayout = useFormLayout;

export default FormLayout;
