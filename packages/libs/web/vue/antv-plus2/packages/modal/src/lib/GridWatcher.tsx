import { useComponentEl, useEffect, useInherit, usePropLocal } from "@yuyi919/vue-use";
import { extractProps, getPropsClass, VueComponent2 } from "@antv-plus2/helper";
import { styled } from "@antv-plus2/theme";
import { Col, IColProps } from "ant-design-vue";
import { debounce, reduce } from "lodash";
import { computed, defineComponent } from "vue-demi";

const AutoColProps = getPropsClass(Col, {
  xl: 16,
  lg: 19,
  md: 20,
});
export const GridWatcher: VueComponent2<InstanceType<typeof AutoColProps>> = defineComponent({
  model: {
    prop: "value",
    event: "change",
  },
  emits: ["change"],
  props: {
    value: {
      type: Number,
    },
    ...extractProps(AutoColProps),
  },
  setup(props, context) {
    const [getInherit] = useInherit(context);
    const [, { update }] = usePropLocal<number, number>(
      () => props.value,
      (width) => {
        console.log("udpate width", width);
        context.emit("change", width);
      },
      { immediate: true }
    );
    const classes = useStyle();
    const gridClassName = computed(
      () =>
        reduce(
          props as IColProps,
          (str, size, type) =>
            size || props[type as keyof IColProps]
              ? `${str} ${["ant-col", type, size || props[type as keyof IColProps]].join("-")}`
              : str,
          ""
        ) + " watch"
    );
    const elRef = useComponentEl();
    let _lastScreenWidth = 0;
    const methods = {
      watch() {
        if (elRef.value && _lastScreenWidth !== window.innerWidth) {
          const div: HTMLDivElement = elRef.value.querySelector(".watch") as HTMLDivElement;
          const width = div.offsetWidth;
          update(width, true);
          // context.emit("change", width);
          console.error("modal watch", width, _lastScreenWidth, window.innerWidth);
          _lastScreenWidth = window.innerWidth;
        }
      },
    };
    useEffect(() => {
      methods.watch();
      methods.watch = debounce(methods.watch, 100);
      window.addEventListener("resize", methods.watch);
      return () => window.removeEventListener("resize", methods.watch);
    });
    return () => {
      const { on } = getInherit();
      return (
        <div class={classes.value} {...{ on }}>
          <div class={gridClassName.value} />
        </div>
      );
    };
  },
});
const useStyle = styled.makeUse`
  position: fixed;
  top: 0;
  width: 100vw;
`;
