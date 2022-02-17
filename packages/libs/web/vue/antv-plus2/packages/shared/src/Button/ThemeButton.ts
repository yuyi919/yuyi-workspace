/* eslint-disable no-unused-expressions */
import { computed, ComputedRef } from "vue-demi";
import { IButtonProps } from "ant-design-vue";
import { ButtonProps } from "./ButtonProps";
import classNames from "./Theme.module.less";

const typeMap = {
  ghost: true,
  primary: true,
  danger: true,
  dashed: true,
  default: true,
};
export function useThemedButton(props: ButtonProps): ComputedRef<{
  props: IButtonProps;
  class: string[];
}> {
  return computed(() => {
    const { type = "default", colorInherit } = props;
    // console.log(classNames, [
    //   classNames.root,
    //   classNames[type],
    //   type === "link" && colorInherit && "color-inherit",
    // ])
    return {
      props: { type: type in typeMap ? type : "primary" } as IButtonProps,
      class: [
        classNames.root,
        classNames[type],
        type === "link" && colorInherit && "color-inherit",
      ] as string[],
    };
  });
}
