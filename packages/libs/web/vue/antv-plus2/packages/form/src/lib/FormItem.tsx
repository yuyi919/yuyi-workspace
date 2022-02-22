import { Types } from "@yuyi919/shared-types";
import { getGridSpanStyle, useGridSpan } from "@antv-plus2/shared";
import { useEffect, useElementRect, useInherit, useNamedRef, useState } from "@yuyi919/vue-use";
import { Icon, Popover, Tooltip } from "ant-design-vue";
import { ComputedRef, computed, defineComponent } from "vue-demi";
import { cls, usePrefixCls } from "../__builtins__";
import { FormLayoutShallowContext, useFormLayout } from "./context";
import { FormItemPropConfig, FormItemProps, useFormLayoutItemProps } from "./FormItemProps";
import { VueComponent2 } from "@antv-plus2/helper";

export function useFormItemLayout(props: FormItemProps): ComputedRef<FormItemProps> {
  const layoutRef = useFormLayout();
  return computed(() => {
    const { value: layoutProps } = layoutRef;
    const autoProps = useFormLayoutItemProps(props, (key, value, option) => {
      return key in layoutProps ? value ?? layoutProps[key as keyof typeof layoutProps] : value;
    }) as FormItemProps;
    // console.log("autoProps gridSpan", autoProps.gridSpan, autoProps, {...autoProps});
    return autoProps;
  });
}

function useOverflow<Container extends HTMLElement, Content extends HTMLElement>() {
  const containerRef = useNamedRef<Container>("containerRef");
  const contentRef = useNamedRef<Content>("contentRef");
  const [containerSize] = useElementRect(containerRef.ref());
  const [contentSize] = useElementRect(contentRef.ref());
  return {
    overflow: computed(() => {
      if (containerRef.value && contentRef.value) {
        const contentWidth = contentSize.width;
        const containerWidth = containerSize.width;
        return contentWidth && containerWidth && containerWidth < contentWidth;
      }
    }),
    containerRef,
    contentRef,
  };
}

function useOverflow2<Container extends HTMLElement, Content extends HTMLElement>() {
  const [overflow, setOverflow] = useState(false);
  const containerRef = useNamedRef<Container>("containerRef");
  const contentRef = useNamedRef<Content>("contentRef");

  useEffect(() => {
    requestAnimationFrame(() => {
      if (containerRef.value && contentRef.value) {
        const contentWidth = contentRef.value.getBoundingClientRect().width;
        const containerWidth = containerRef.value.getBoundingClientRect().width;
        if (contentWidth && containerWidth && containerWidth < contentWidth) {
          if (!overflow) setOverflow(true);
        } else {
          if (overflow) setOverflow(false);
        }
      }
    });
    return () => {};
  });

  return {
    overflow,
    containerRef,
    contentRef,
  };
}

export const FormItemLabel: VueComponent2<FormItemProps> = defineComponent({
  props: FormItemPropConfig,
  setup(props) {
    const { overflow, containerRef, contentRef } = useOverflow();
    const getOverflowTooltip = () => {
      const { label, tooltipLayout, tooltip } = props;
      if (overflow.value) {
        return (
          <div>
            <div>{label}</div>
            {tooltipLayout === "text" && <div>{tooltip}</div>}
          </div>
        );
      }
      return tooltip;
    };

    const renderLabelText = () => {
      const { label, tooltip, asterisk, tooltipLayout, prefixCls } = props;
      const labelChildren = (
        <div class={cls(`${prefixCls}-label-content`)} ref={containerRef}>
          {asterisk && <span class={cls(`${prefixCls}-asterisk`)}>{"*"}</span>}
          <label ref={contentRef}>{label}</label>
        </div>
      );

      if ((tooltipLayout === "text" && tooltip) || overflow.value) {
        return (
          <Tooltip placement="top" align={{ offset: [0, 10] }} title={getOverflowTooltip()}>
            {labelChildren}
          </Tooltip>
        );
      }
      return labelChildren;
    };

    const renderTooltipIcon = () => {
      const { tooltip, tooltipLayout, prefixCls } = props;
      if (tooltip && tooltipLayout === "icon") {
        return (
          <span class={cls(`${prefixCls}-label-tooltip-icon`)}>
            <Tooltip placement="top" align={{ offset: [0, 2] }} title={tooltip}>
              <Icon type="question-circle" theme="outlined" />
            </Tooltip>
          </span>
        );
      }
    };

    return () => {
      if (!props.label) return null;
      const { label, tooltip, labelCol, labelStyle, colon, tooltipLayout, prefixCls, enableCol } =
        props;
      return (
        <div
          class={cls({
            [`${prefixCls}-label`]: true,
            [`${prefixCls}-label-tooltip`]: (tooltip && tooltipLayout === "text") || overflow.value,
            [`${prefixCls}-item-col-${labelCol}`]: enableCol && !!labelCol,
          })}
          style={labelStyle}
        >
          {renderLabelText()}
          {renderTooltipIcon()}
          {(typeof label !== "string" || label.trim() !== "") && (
            <span class={cls(`${prefixCls}-colon`)}>{colon ? ":" : ""}</span>
          )}
        </div>
      );
    };
  },
});
export const FormLayoutItem: VueComponent2<FormItemProps> = defineComponent({
  props: FormItemPropConfig,
  setup(props, context) {
    const popoverContainerRef = useNamedRef<HTMLDivElement>("popoverContainerRef");
    const [getInherit] = useInherit(context);
    const [activeRef, setActive] = useState(false);
    const formLayoutRef = useFormItemLayout(props);
    const [gridSpan] = useGridSpan(() => formLayoutRef.value.gridSpan);
    let prevFeedbackText: any;
    const feedbackTextRender = computed(() => {
      const feedbackText = formLayoutRef.value.feedbackText;
      const text = feedbackText || prevFeedbackText;
      if (feedbackText) {
        prevFeedbackText = feedbackText;
      }
      return text;
    });

    return () => {
      const ICON_MAP = {
        error: <Icon type="close-circle" theme="filled" />,
        success: <Icon type="check-circle" theme="filled" />,
        warning: <Icon type="exclamation-circle" theme="filled" />,
      };
      const formLayout = formLayoutRef.value;
      const active = activeRef.value;
      const { children } = getInherit();
      const {
        layout,
        addonBefore,
        addonAfter,
        feedbackStatus,
        extra,
        feedbackText,
        fullness,
        feedbackLayout,
        inset,
        bordered,
        wrapperCol,
        labelAlign,
        wrapperAlign,
        size,
        labelWrap,
        wrapperWrap,
        enableCol,
        wrapperStyle,
      } = formLayout;
      const prefixCls = usePrefixCls("formily-item", props);
      // console.log(formLayout);
      const feedbackIcon =
        formLayout.feedbackIcon ?? ICON_MAP[feedbackStatus as keyof typeof ICON_MAP];
      const formatChildren =
        feedbackLayout === "popover" ? (
          <Popover
            autoAdjustOverflow
            placement="top"
            getPopupContainer={() => popoverContainerRef.value}
            content={
              <div
                class={cls({
                  [`${prefixCls}-${feedbackStatus}-help`]: !!feedbackStatus,
                  [`${prefixCls}-help`]: true,
                })}
              >
                {feedbackIcon}
                {feedbackTextRender.value}
              </div>
            }
            visible={!!feedbackText}
          >
            {children}
          </Popover>
        ) : (
          children
        );

      const gridStyles: Types.CSSProperties = {};

      // console.log("gridSpan", formLayoutRef.value.gridSpan, gridSpan.value);
      if (gridSpan.value) {
        Object.assign(gridStyles, getGridSpanStyle(gridSpan.value));
        // gridStyles.gridColumnStart = `span ${gridSpan}`;
      }

      const FeedbackText = feedbackLayout !== "popover" && feedbackLayout !== "none" && (
        <transition name={`${prefixCls}-help`}>
          {!!feedbackText && (
            <div
              class={cls({
                [`${prefixCls}-${feedbackStatus}-help`]: !!feedbackStatus,
                [`${prefixCls}-help`]: true,
              })}
            >
              {feedbackTextRender.value}
            </div>
          )}
        </transition>
      );
      // console.log(gridStyles);
      return (
        <div
          ref={popoverContainerRef}
          style={gridStyles}
          class={cls({
            [`${prefixCls}`]: true,
            [`${prefixCls}-layout-${layout}`]: true,
            [`${prefixCls}-${feedbackStatus}`]: !!feedbackStatus,
            [`${prefixCls}-feedback-has-text`]: !!feedbackText,
            [`${prefixCls}-size-${size}`]: !!size,
            [`${prefixCls}-feedback-layout-${feedbackLayout}`]: !!feedbackLayout,
            [`${prefixCls}-fullness`]: fullness || inset || !!feedbackIcon,
            [`${prefixCls}-inset`]: inset,
            [`${prefixCls}-active`]: active,
            [`${prefixCls}-inset-active`]: inset && active,
            [`${prefixCls}-label-align-${labelAlign}`]: true,
            [`${prefixCls}-control-align-${wrapperAlign}`]: true,
            [`${prefixCls}-label-wrap`]: labelWrap,
            [`${prefixCls}-control-wrap`]: wrapperWrap,
            [`${prefixCls}-bordered-none`]: bordered === false || inset,
          })}
          on={{
            "!focus": () => {
              if (feedbackIcon || inset) {
                setActive(true);
              }
            },
            "!blur": () => {
              if (active || feedbackIcon || inset) {
                setActive(false);
              }
            },
          }}
        >
          <FormItemLabel {...{ props: { ...formLayoutRef.value, prefixCls } }} />
          <div
            class={cls({
              [`${prefixCls}-control`]: true,
              [`${prefixCls}-item-col-${wrapperCol}`]: enableCol && !!wrapperCol,
            })}
          >
            <div class={cls(`${prefixCls}-control-content`)}>
              {addonBefore && <div class={cls(`${prefixCls}-addon-before`)}>{addonBefore}</div>}
              <div
                key="control-content-component"
                style={wrapperStyle}
                class={cls({
                  [`${prefixCls}-control-content-component`]: true,
                  [`${prefixCls}-control-content-component-has-feedback-icon`]: !!feedbackIcon,
                })}
              >
                {/* {h(FormLayoutShallowContext.Provider, { props: { value: void 0 }}, [formatChildren])} */}
                {
                  // @ts-ignore
                  <FormLayoutShallowContext.Provider value={undefined}>
                    {formatChildren}
                  </FormLayoutShallowContext.Provider>
                }
                {feedbackIcon && (
                  <div class={cls(`${prefixCls}-feedback-icon`)}>{feedbackIcon}</div>
                )}
              </div>
              {addonAfter && <div class={cls(`${prefixCls}-addon-after`)}>{addonAfter}</div>}
            </div>
            {FeedbackText}
            {extra && <div class={cls(`${prefixCls}-extra`)}>{extra}</div>}
          </div>
        </div>
      );
    };
  },
});
